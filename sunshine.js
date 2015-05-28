( function(window, factory) {
    if(window.hasOwnProperty("Sunshine")) {
        console.log("Sunhine warning: You made an object named Sunshine. It is overriden by Sunhine");
    }

    factory(window);

} (window, function(global) {

    var internals = {};

    var ApplicationCache = function() {
        var objects = {};

        this.createStore = function(storeName) {
            if( ! this.hasStore(storeName)) {
                objects[storeName] = {};
            } else {
                new Error("Cache " + storeName + " is already created");
            }

            return this;
        };

        this.saveToStore = function(storeName, objectName, object) {
            if( ! this.hasStore(storeName) ) {
                throw new Error("Sunshine error: ApplicationStore::saveToStore()-> No storage named " + storeName + " has been created");
            }

            if(Sunshine.isObject(object) == false) {
                throw new Error("Sunshine error: Application cache: Saved value has to be an object. " + Sunshine.frCapitalize(Sunshine.typeOf(object)) + " given");
            }

            objects[storeName][objectName] = object;
        };

        this.hasStore = function(storeName) {
            return (objects.hasOwnProperty(storeName)) ? true : false;
        };

        this.getStore = function(storeName) {
            if( ! this.hasStore(storeName) ) {
                throw new Error("Sunshine error: ApplicationStore::getStore()-> No storage named " + storeName + " has been created");
            }

            return objects[storeName];
        };


        this.hasStoredObject = function(storeName, objectName) {
            if( ! this.hasStore(storeName) ) {
                throw new Error("Sunshine error: ApplicationStore::hasStoredObject()-> No storage named " + storeName + " has been created");
            }

            if( ! objects[storeName].hasOwnProperty(objectName) ) {
                return false;
            }

            return true;
        };

        this.getStoredObject = function(storeName, cachedObjectString) {
            if( ! this.hasStore(storeName) ) {
                throw new Error("Sunshine error: ApplicationStore::getStoredObject()-> No storage named " + storeName + " has been created");
            }

            return objects[storeName][cachedObjectString];
        };
    };

    var ObjectFactory = {};
    internals.cache = new ApplicationCache();
    internals.cache.createStore("ObjectFactoryCache");

    ( function(cache) {
        ObjectFactory = {
            validator: null,
            dataHolder: null,
            observationObject: null,

            __initialize: function() {
                this.validator = this.createValidator();
                this.dataHolder = this.createDataHolder();
            },

            __destroy: function() {
                this.validator = null;
                this.dataHolder = null;
            },

            __cleanUp: function() {
                this.validator = null;
            },

            createValidator: function() {
                return {
                    length: null,
                    regObject: null,
                    model: null,
                    __initialize: null,
                    registerAll: null,

                    isRegisterObjectValid: function(object) {
                        var len = 0;

                        if( ! Sunshine.isObject(object)) {
                            throw new Error("Sunshine error: Register variable is not an object");
                        }

                        ( function(validatorScope) {
                            for(var obj in object) {
                                if(object.hasOwnProperty(obj)) {
                                    if(Sunshine.isFunction(object[obj])) {
                                        if(obj == "__initialize" || obj == "registerAll") {
                                            validatorScope[obj] = object[obj];
                                            delete object[obj];
                                        }
                                    } else {
                                        throw new Error("Sunshine error: " + obj + " has to be a function");
                                    }
                                    len++;
                                }
                            }
                        } (this) );

                        if(len == 0) {
                            throw new Error("Sunshine error: Register object can not be empty");
                        }

                        this.length = len;
                        this.regObject = object;

                        return true;
                    },

                    isModelValid: function(model) {
                        var len = 0;

                        if( ! Sunshine.isObject(model)) {
                            throw new Error("Sunshine error: Observation variable is not an object");
                        }

                        ( function() {
                            for(var obj in model) {
                                len++;

                                if(model.hasOwnProperty(obj)) {
                                    Sunshine.original[obj] = model[obj];
                                }
                            }
                        } () );

                        if(len == 0) {
                            throw new Error("Sunshine error: Observation object can not be empty");
                        }

                        this.model = model;

                        return true;
                    },

                    isSunshineValid: function(regObject, model) {
                        this.isRegisterObjectValid(regObject);
                        this.isModelValid(model);

                        return true;
                    },

                    getValidData: function() {
                        var validData = {};

                        validData.length = this.length;
                        validData.regObject = this.regObject;
                        validData.model = this.model;
                        if(this.__initialize !== null) {
                            validData.__initialize = this.__initialize;
                        }

                        return validData;
                    }
                }
            },

            createDataHolder: function() {
                return {
                    data: null,

                    __initialize: function(data) {
                        this.data = data;
                    },

                    get: function(object, prop) {
                        var temp = this.data[object][prop];
                        return temp;
                    },

                    has: function(object, prop) {
                        if( ! this.data.hasOwnProperty(object)) {
                            return false;
                        }

                        if( ! this.data[object].hasOwnProperty(prop)) {
                            return false;
                        }

                        return true;
                    },

                    isSameAs: function(value, innerKey) {
                        console.log(value, innerKey, this.data.model[innerKey]);
                        if(value == this.data.model[innerKey]) {
                            return true;
                        }

                        return false;
                    },

                    cloneInnerData: function() {
                        var model = this.data.model,
                            t = {};

                        for(var m in model) {
                            if(model.hasOwnProperty(m)) {
                                t[m] = model[m];
                            }
                        }

                        return t;
                    }
                }
            },

            createObservationObject: function() {
                return {
                    dataHolder: null,
                    interval: null,
                    tempModel: {},

                    __initialize: function(dataHolder) {
                        this.dataHolder = dataHolder;
                        this.tempModel = this.dataHolder.cloneInnerData();
                    },

                    observe: function() {
                        console.log(this.dataHolder);

                        var scope = this;
                        var callback = function() {
                            for(var i in scope.tempModel) {
                                if(scope.tempModel.hasOwnProperty(i) && scope.dataHolder.has("regObject", i)) {
                                    if( ! scope.dataHolder.isSameAs(scope.tempModel[i], i)) {
                                        var func = scope.dataHolder.get("regObject", i);

                                        func();

                                        scope.tempModel[i] = scope.dataHolder.get("model", i);
                                    }
                                }
                            }
                        };

                        this.interval = window.setInterval(callback, 100);
                    }
                }
            }
        };
    } (internals.cache) );

    var InnerSunshine = function() {
        ObjectFactory.__initialize();

        this.register = function(registerObject, model) {
            if(registerObject == null) {
                ObjectFactory.__destroy();
            } else {
                var validator = ObjectFactory.validator;

                if(validator.isSunshineValid(registerObject, model)) {
                    var dataHolder = ObjectFactory.dataHolder;
                    dataHolder.__initialize(validator.getValidData());

                    var observer = ObjectFactory.createObservationObject();
                    observer.__initialize(ObjectFactory.dataHolder)
                    observer.observe();
                }
            }
        };

        this.unregister = function() {

        }
    };

    InnerSunshine.prototype = {
        version: "0.0.1",
        original: {},

        isArray : function(array) {
            return this.valueIs(array, "array");
        },

        isObject: function(object) {
            return this.valueIs(object, "object");
        },

        isString: function(string) {
            return this.valueIs(string, "string");
        },

        isFunction: function(func) {
            return this.valueIs(func, "function");
        },

        valueIs: function(value, type) {
            if(({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == type) {
                return true;
            }

            return false;
        },

        typeOf: function(value) {
            return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
        },

        frCapitalize: function(string) {
            if( ! this.isString(string)) {
                return null;
            }

            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };

    global.Sunshine = new InnerSunshine();
}) );