import {Validator} from './validation.js';
import { MemberService } from './memberService.js';
import {LoanRepository} from './loanProcesses.js';

let initialMembers = [];

async function init() {
    try {
        initialMembers = await MemberService.getMembers();
        document.getElementById("right").innerHTML = inner;
    } catch (err) {
        console.error("errorinit:", err);
    }
}

let inner= "<h3>" + ("Member ID".padEnd(30, " ")) + "Loan ID".padEnd(50, " ") + ("Borrow Date".padEnd(30, " ")) + ("Return Date".padEnd(50, " ")) + "</h3>";

document.getElementById("searchForm").addEventListener('submit', async function(event) {
    event.preventDefault();
    const searchedMember = memberID.value.trim().toLowerCase();
    const searchedLoan = loanID.value.trim().toLowerCase();

    matchedResults = initialMembers.filter(item => {
        const matchMember = item.memberID.toLowerCase().includes(searchedMember);
        return matchMember;
    });

    if (matchedResults.length != 0){
        const today = new Date();
        const returnDay = new Date();
        returnDay.setDate(today.getDate() + 14);
        await LoanRepository.createLoan(memberID.value, loanID.value, today, returnDay);
        let add = ((memberID.value.trim().padEnd(30, " ")) + 
                    ((loanID.value.trim().padEnd(50, " ") +
                    today.toLocaleDateString().padEnd(30, " ")) +
                    (returnDay.toLocaleDateString() +14 ).padEnd(50, " ")));
        inner = inner + "<h4>" + add + "</h4>";
        document.getElementById("right").innerHTML = inner;
    }

    else{
        alert("Eşleşen üye bulunamadı!");
    }



});


