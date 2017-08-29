const model = require('../model');
let UserModel = model.User;

var id = 0;

function nextId() {
    id++;
    return 'p' + id;
}

function User(name, pw) {
    this.id = nextId();
    this.name = name;
    this.password = pw;
}

module.exports = {
    getUsers: async () => {
        var users = await UserModel.findAll();
        if (users){
            return JSON.stringify({ok: true, msg: 'users returned.', res: users});
        } else {
            return JSON.stringify({ok: false, msg: 'no users in db.', res: users});
        };
    },

    getUser: async (name) => {
        var user = await UserModel.findOne({
            where: {
                name: name
            }
        });
        if (user){
            return JSON.stringify({ok: true, msg: 'user returned.', res: user});
        } else {
            return JSON.stringify({ok: false, msg: 'user not in db.', res: user});
        }
    },

    validateUser: async (user) => {
        var user = JSON.parse(user);
        if (!user) {
            return false;
        }
        var res = await UserModel.findOne({
            where: {
                name: user.name,
                password: user.password
            }
        });
        if (!res) {
            return JSON.stringify({ok: false, msg: 'user not validated.', res: res});
        } else {
            return JSON.stringify({ok: true, msg: 'user validated.', res: res});
        }
    },

    createUser: async (user) => {
        var now = Date.now();
        var user = JSON.parse(user);
        if (!user) {
            console.log('parse user failed.');
            return JSON.stringify({ok: false, msg: 'user not defined.'});
        }

        if (!user.name || !user.password) {
            console.log('user or password null');
            return JSON.stringify({ok: false, msg: 'user or password null'});
        }

        var u = await UserModel.findOne({
            where: {
                name: user.name
            }
        });

        if (!u) {
            console.log('user not exists');
        } else {
            return JSON.stringify({ok: false, msg: 'user exists, choosing another name.'});
        }

         var p =  await UserModel.create({
            id: 'd-' + now,
            name: user.name,
            password: user.password,
            createdAt: now,
            updatedAt: now,
            version: 0
        });

        if (p) {
            return JSON.stringify({ok: true, msg: 'user created.', res: p});
        } else {
            return JSON.stringify({ok: false, msg: 'user not created.', res: p});
        }
    },

    deleteUser: async (name) => {
        var user = await UserModel.findAll({
            where: {
                name: name
            }
        });
        user.destory();
        return JSON.stringify({ok: true, msg: 'user not deleted.', res: user});
    }
};