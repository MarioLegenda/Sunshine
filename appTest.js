var model = {
    name: "Mario",
    lastName: "Škrlec",
    age: 28
};

Sunshine.register({
    __initialize: function() {

    },

    name: function() {
        console.log("on name change");
    },

    lastName: function() {
        //console.log("on last name change");
    },

    age: function() {
        console.log("on age change");
    }
}, model);

model.name = "legenda";
model.name = "kreten";
model.name = "budala";
model.name = "a";
model.name = "b";
model.name = "c";
model.name = "d";
model.name = "e";
model.name = "f";
model.name = "g";
model.name = "h";