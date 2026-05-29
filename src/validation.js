export class Validator{

    static isValidEmail(email){
        const emailReg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailReg.test(email.trim());
    }

    static isValidPhone(phone){
        const phoneReg = /^[\+]?[0-9]{0,3}\W?+[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        return phoneReg.test(phone.trim());
    }

    static isNotEmpty(value){
        if (value.trim().lenght>0){
            return value;
        }
    }

}