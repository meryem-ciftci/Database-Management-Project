import {dbConnection} from './dbConnection.js';

const Collection = 'members';

function getMemberId(){
        const prefix ="I";
        const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
        let random = "";

        for (let i=0; i<26; i++){
            const randomI = Math.floor(Math.random() * alphabet.length);
            random += alphabet[randomI];
        }

        return `${prefix}-${random}`;
    }

export class MemberService{

    
    static getMembers(){
        return dbConnection.getCollection(Collection);
    }

    static addMember(memberData){
        memberData.id=getMemberId();
        memberData.readBooks=0;
        members.push(memberData);
        dbConnection.saveCollection(Collection,members);
        return 1;
    }

    static updateMember(memberId,updatedData){
        let members = this.getMembers();
        const index = members.findIndex(m=>m.id === memberId);
        if (index !==-1){
            members[index]={...members[index],...updatedData};
            dbConnection.saveCollection(Collection,members);
            return true;
        }
        return false;
    }

    static deleteMember(memberId){
        let members = this.getMembers();
        members = members.filter(m=>m.id !== memberId);
        dbConnection.saveCollection(Collection,members);
    }
}