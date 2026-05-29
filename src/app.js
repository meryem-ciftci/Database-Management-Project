//will change later when wrote backend and finished the tables

import {Validator} from './validation.js';
import { MemberService } from './memberService.js';

const form = document.getElementById('form');
const tableBody = document.getElementById('tableBody');
const error = document.getElementById('error');

async function init(){
    try{
        const initialMembers = await MemberService.getMembers();
        await render(initialMembers);
    } catch (err){
        console.error("errorinit:",err);
    }
}

async function render(incomingData){

    let memberList = [];

    if (Array.isArray(incomingData)){
        memberList = incomingData;
    } else if (incomingData && Array.isArray(incomingData.data)) {
        memberList = incomingData;
    } else if (incomingData) {
        memberList = [incomingData];
    }


    tableBody.innerHTML = '';

    memberList.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.FName}</td>
            <td>${member.LName}</td>
            <td>${member.MailAddress}</td>
            <td>${member.PhoneNumber}</td>
            <td>${member.Region || ''}</td>
            <td>${member.PostalCode || ''}</td>
            <td>${member.ReadBooks}</td>
            <td>${member.BorrowedBooks}</td>
            <td>
                <button class="btn-update" data-id="${member.MemberID}">Update</button>
                <button class="btn-delete" data-id="${member.MemberID}">Delete</button>
            </td>
        `
        tableBody.appendChild(row);
    })

    attachActionListeners();
}

form.addEventListener('submit', async (e)=> {
    e.preventDefault();
    if (error) error.textContent='';

    const fname = document.getElementById('fname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const lname = document.getElementById('lname').value;
    const region = document.getElementById('region').value;
    const postalCode = document.getElementById('postalCode').value;

    if (!Validator.isNotEmpty(fname)) {return;};
    if (!Validator.isNotEmpty(lname)) {return;};
    if (!Validator.isValidEmail(email)) {return;};
    if (!Validator.isValidPhone(phone)) {return;};

    try {
        const response = await MemberService.addMember({fname, lname, email, phone, region, postalCode});

        if(response){
            form.reset;
            const allMembers = await MemberService.getMembers();
            await render(allMembers);
        }
    } catch(err){
        console.error("arayüz...",err);
    }

});

function attachActionListeners(){
    document.querySelectorAll('.btn-update').forEach(btn=> {
        btn.addEventListener('click', async (e)=> {
            const id = e.target.getAttribute('data-id');
            const members = await MemberService.getMembers();
            const target = members.find(m => m.MemberID === id);

            const updatedFName = prompt("New First Name:", target.FName);
            const updatedLName = prompt("New Last Name:", target.LName);
            const updatedPostal = prompt("New Postal Code:", target.PostalCode);
            const updatedRegion = prompt("New Region:", target.Region);
            const updatedEmail = prompt("New Email:", target.MailAddress);
            const updatedPhone = prompt("New Phone:", target.PhoneNumber);

            if (updatedFName && updatedLName && Validator.isValidEmail(updatedEmail) && Validator.isValidPhone(updatedPhone)){
                await MemberService.updateMember(id, {fname:updatedFName,lname:updatedLName,email:updatedEmail,phone:updatedPhone,region:updatedRegion,postalCode:updatedPostal});

                const allMembers = await MemberService.getMembers();
                await render(allMembers);
            }

            
        })
    })

    document.querySelectorAll('.btn-delete').forEach(btn=>{
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    await MemberService.deleteMember(id);

                    const allMembers = await MemberService.getMembers();
                    await render(allMembers);
                })
            })
}

document.addEventListener('DOMContentLoaded', async() => {
    const initialMembers = await MemberService.getMembers();
    render(initialMembers);
})
