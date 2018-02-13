var budgetController = (function() {
	// expense object constructor - can be instantiated
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	// data structure
	var data = {
		budget: 0,
		allItems: {
			inc:[],
			exp:[]
		},
		totals: {
			exp: 0,
			inc: 0
		},
		percentage: -1 // -1 stands for not exist
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(element) {
			sum += element.value;
		});
		data.totals[type] = sum;
	}


	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			// want the id = last ID + 1
			ID = (data.allItems[type].length == 0? 0: data.allItems[type][data.allItems[type].length-1].id + 1);
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index; 

			ids = data.allItems[type].map(function(current) {
				return current.id; // current is the pointer to the array
			});
			index = ids.indexOf(id);

			if (index !== -1) { // then we want to delete
				// splice
				data.allItems[type].splice(index, 1); // splice(num_of_index_starting_delete, how_many_to_delete)
			}
		},

		calculateBudget: function() {
			// calc total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			// calc budge: income - expense
			data.budget = data.totals.inc - data.totals.exp;
			// calc the percentage of income that spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			} else {
				data.percentage = -1;
			}
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		getAllExpenses: function() {
			return {
				allExpItems: data.allItems.exp,
				totalInc: data.totals.inc
			}
		},

		testing: function() {
			console.log(data)
		}
	}
	
})();

var UIController = (function() {

	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container:'.container',
		month: '.budget__title--month'
	}

	return {
		getinput: function() {
			return { // return the three user input as an object
				type: document.querySelector(DOMStrings.inputType).value,
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			}
			
		},

		addListItem: function(obj, type, budget) {
			// create HTML string with placeholder text
			var html, element, newHTML;
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			} else if (type === 'exp') {
				element = DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">%percentage%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}

			// replace the placeholder text with some actual data
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', obj.value);
			if (type === 'exp') {
				var totalinc = budget.totalInc;
				if (totalinc == 0) {
					newHTML = newHTML.replace('%percentage%', '---')
				} else {
					var per = Math.round((obj.value/totalinc)*100);
					newHTML = newHTML.replace('%percentage%', per + '%');
				}
			}
			// insert the HTML file
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArray;
			//notice the CSS style concatenate 
			fields = document.querySelectorAll(DOMStrings.inputValue + ',' + DOMStrings.inputDescription); // this returns a list
			console.log(fields);

			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArray[0].focus();
		},

		displayBudgets: function(obj) {
			document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage +'%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		updateExpPercentage: function(obj) {
			var expItems = obj.allExpItems;
			var totalInc = obj.totalInc;
			expItems.forEach(function(el) {
				var per;
				if (totalInc == 0) {
					per = '---';
				} else {
					per = Math.round((el.value/totalInc)*100);
				}
				console.log(document.getElementById('exp-'+el.id).innerHTML);
				var newhtml = '<div class="item__description">' + el.description + '</div> <div class="right clearfix"> <div class="item__value">' + el.value + '</div> <div class="item__percentage">' + per + '%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div>'
				document.getElementById('exp-'+el.id).innerHTML = newhtml;
			})
		},

		setupTime: function () {
			var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var today = new Date();
			var time = monthNames[today.getMonth()] + ', ' + today.getFullYear();
			document.querySelector(DOMStrings.month).textContent = time; 
		},

		getDOMStrings: function() {
			return DOMStrings;
		}
	};
})();


// global app controller
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListensers = function() {
		var DOMStrings = UICtrl.getDOMStrings();
		document.querySelector(DOMStrings.inputBtn).addEventListener('click', ctrlAddItem);
		// should also add new item when user hit 'enter'
		// keyboard event - MDN
		document.addEventListener('keypress', function(event) {
			// check if it is the 'enter' key was pressed
			// .which is for older version of browser
			if (event.keyCode == 13 || event.which === 13) {
				ctrlAddItem();
			} 
		});

		document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);
	};

	var updateBudget = function () {
		// 1. calculate the budget
		budgetCtrl.calculateBudget();
		// 2. return the budget
		var budget = budgetCtrl.getBudget();
		// 3. display the budget on UI
		UICtrl.displayBudgets(budget);
	};

	var ctrlAddItem = function() {
		// executed as soon as the add btn is clicked
		var input, newItem;
		// 1. get the filed input data
		input = UICtrl.getinput();

		if (input.description === "" || isNaN(input.value) || input.value <= 0) return;
	
		// 4. calculate & update budget
		updateBudget();

		// 2. add the item to the budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		// 3. add the item to the UI
		UICtrl.addListItem(newItem, input.type, budgetCtrl.getBudget());
		// 3.4 clear the fields
		UICtrl.clearFields();
		
		updateBudget();

		if (input.type === 'inc') {
			// call the funcion to update all the expense items
			var expItems = budgetCtrl.getAllExpenses();
			UICtrl.updateExpPercentage(expItems);
		}
	};

	var ctrlDeleteItem = function(event) { // event is the object that event listener caught, can be called by any name
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]); // Need to do the casting!!!
			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			// 2. delete the item from the UI
			UICtrl.deleteListItem(itemID);
			// 3. update and show the new budget
			updateBudget();
		}
		// if the deleted item is an income, need to update the expense items' percentage correspondingly
		if (type === 'inc') {
			var expItems = budgetCtrl.getAllExpenses();
			UICtrl.updateExpPercentage(expItems);
		}
	};
		

	return {
		init: function() { // public initialization function
			UICtrl.displayBudgets({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			})
			setupEventListensers();
			UICtrl.setupTime();

		}

	};

})(budgetController, UIController);

// start everything
controller.init();


