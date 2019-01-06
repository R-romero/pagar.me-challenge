//Sets the split rules
let transaction_data = {
	"split_rules": [
	  {
		recipient_id: "RECIPIENT_ID",
		charge_processing_fee: true,
		liable: true,
		percentage: 25
	  },
	  {
		recipient_id: "RECIPIENT_ID",
		charge_processing_fee: true,
		liable: false,
		percentage: 75
	  }
	]
}

//Updates the view Total value
Cart_handler = () => {
	document.getElementById('prodTotal1').innerHTML = 'R$ ' + event.srcElement.value * 65 +'.00'
}

//Calls on pagar.me API to make a transaction
Card_transaction = (data) => {
    pagarme.client.connect({ api_key : 'API_KEY' })
	.then(client => client.transactions.create(data))
	.then(Primary_balance())
}

//Requests the current Balance of an account from pagar.me API
Primary_balance = () => {
    pagarme.client.connect({  api_key : 'API_KEY' })
    .then(client => client.balance.primary())
	.then(balance => document.getElementById('account_info').innerHTML =
	  'Saldo disponível: R$' + balance.available.amount/100 + '<br>' +
	  'Saldo a Receber:  R$' + balance.waiting_funds.amount/100)
}

//Manages the checkout
Checkout = () =>{
	checkout = new PagarMeCheckout.Checkout(
		{
		encryption_key: "ENCRYPTION_KEY",
		success: function(data) {
			Card_transaction(Transaction_load(data))
		},
		error: function(err) {
			console.log(err);
		}
	});
	checkout.open({
		customerData: 'true',
		createToken: 'false',
	});
}
//Assign and rearrange some missing values in accordance to pagarme API for transactions
Transaction_load = (data) => {
	//Items: Object
	data.items = [{
		"id" : '#ITEM-01',
		"title" : 'World of Warcraft Retail',
		"unit_price" : 6500,
		"tangible" : 'false',
		"quantity" : document.getElementById('qt-item1').value,
	}]
	data.amount = data.items[0].quantity * data.items[0].unit_price

	//Billing: Object
	data.billing ={
		"name": data.customer.name,
		"address": data.customer.address
	}
	data.billing.address.country = 'br'
	
	//Customer: Object
	jQuery.extend(data.customer, {
		'country' : 'br',
		'type' : 'individual',
		'external_id': String(Math.floor((Math.random() * 100) + 1)),
		'documents' : [{
			"type" : 'cpf',
			"number" : data.customer.document_number
		}],
		'phone_numbers' : [
			'+55' + data.customer.phone.ddd + data.customer.phone.number,
		]
	})

	//Removing unnecessary keys from Customer: Object
	delete data.customer.address
	delete data.customer.document_number
	delete data.customer.phone

	
	//merging Checkout data with defined Split Rules
	data = Object.assign(data, transaction_data)

	return data
}