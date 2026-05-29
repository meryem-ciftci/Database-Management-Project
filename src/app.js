//will change later when wrote backend and finished the tables

import {Validator} from './validation.js';
import { MemberService } from './memberService.js';

const form = document.getElementById('form');
const tableBody = document.getElementById('tableBody');
const error = document.getElementById('error');

async function render(){
    tableBody.innerHTML = '';
    const members = MemberService.getMembers();

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.readBooks || 0}</td>
            <td>
                <button class="btn-update" data-id="${member.id}">Update</button>
                <button class="btn-delete" data-id="${member.id}">Delete</button>
            </td>
        `
        tableBody.appendChild(row);
    })

    attachActionListeners();
}

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    error.textContent='';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (!Validator.isNotEmpty(name)) {return;};
    if (!Validator.isValidEmail(email)) {return;};
    if (!Validator.isValidPhone(phone)) {return;};

    await MemberService.addMember({name, email, phone});
    form.reset();
    render();
});

const id = e.target.getAttribute('data-id');
const target = members.find(m => m.id === id);

const updatedName = prompt("New Name:", target.name);
const updatedEmail = prompt("New Email:", target.email);
const updatedPhone = prompt("New Phone:", target.phone);

if (updatedName && Validator.isValidEmail(updatedEmail) && Validator.isValidPhone(updatedPhone)){
    MemberService.updateMember(id, {name:updatedName,email:updatedEmail,phone:updatedPhone});
    render();
}

const id = e.target.getAttribute('data-id');
MemberService.deleteMember(id);
render();

window.addEventListener('DOMContentLoaded',render);