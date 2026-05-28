//change after creating backend...
const LOCAL_URL='http://localhost:3000/api/members';


function getMemberId(){
        const prefix ="M";
        const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
        let random = "";

        for (let i=0; i<26; i++){
            const randomI = Math.floor(Math.random() * alphabet.length);
            random += alphabet[randomI];
        }

        return `${prefix}-${random}`;
    }

export class MemberService{

    
    static async getMembers(){
        const response = await fetch(LOCAL_URL);
        return await response.json();
    }

    static async addMember(memberData){
        memberData.id=getMemberId();
        memberData.readBooks=0;
        const response = await fetch(LOCAL_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(memberData)
        });
        return await response.json();
    }

    static async updateMember(memberId,updatedData){
        const response = await fetch(`${LOCAL_URL}/${memberId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedData)
        });
        return await response.json();
    }

    static async deleteMember(memberId){
        const response = await fetch(`${LOCAL_URL}/${memberId}`, {
            method: 'DELETE'
        });
    }
}