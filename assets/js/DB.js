(function () {

	"use strict";

	var DBInterface;

	DBInterface = function () {

		if (!this instanceof DBInterface) {
			return new DBInterface(arguments);
		}

		this.init.apply(this, arguments);

	}

	DBInterface.prototype.init = function (dbName, version, storeNames) {

		var that = this;

		this.openRequest = indexedDB.open(dbName, version);

		this.openRequest.onupgradeneeded = function (e) {
			that.db = e.target.result;

			console.log("Running Upgrade task");

			$(storeNames).each(function () {
				that.createStore(this);
			});
		}

		this.openRequest.onsuccess = function (e) {
			console.log("DB " + dbName + " successfully opened");
			that.db = e.target.result;
		}

		this.openRequest.onerror = function(e) {
            console.log("Error opening db: " + dbName);
            console.dir(e);
        }

	};

	DBInterface.prototype.createStore = function (storeName) {

		var store;

		// Check if ObjectStore exists
		if (!this.db.objectStoreNames.contains(storeName)) {
			store = this.db.createObjectStore(storeName, { 
				autoIncrement: true,
				keyPath: "id" 
			});
		}

	},

	DBInterface.prototype.write = function (table, data) {

		table = [table];

		var transaction = this.db.transaction(table, "readwrite"),
			table = transaction.objectStore(table[0]);

		table.add(data);

	},

	DBInterface.prototype.readAll = function (table) {

		table = [table];

		var transaction = this.db.transaction(table, "readwrite"),
			table = transaction.objectStore(table[0]),
			keyRange = IDBKeyRange.lowerBound(0),
			cursorRequest = table.openCursor(keyRange),
			ret = [];

		cursorRequest.onsuccess = function (e) {
			console.log(e);
			var result = e.target.result;
			ret.push(result);
			result.continue();
		}

		return ret;

	}

	window.DBInterface = DBInterface;

}());