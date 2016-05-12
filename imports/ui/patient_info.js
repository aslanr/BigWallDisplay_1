import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Patients } from '../api/patients.js';

import './patient_info.html';
import './patient_info.css';


// This dumy patient is just to represent the "empty template"
// meaning giving "fake" context data to the template
const dummy_patient = {
	"_id" : '000',
	"lastName" : "last name",
	"firstName" : "first name",
	"gender" : "male",
	"birthDate" : new Date(),
	"maritalStatus" : "single",
	"race" : "white",
	"allergies" : "none",
	"height" : 180,
	"weight" : 80
}


Template.patient_info.helpers({
   patient() {
   	//return a single patient for template data context
   	const instance = Template.instance();
    if (instance.state.get('patientID')) {//check patient that has been selected on the dropdown
      const patientID = instance.state.get('patientID');
      return Patients.findOne({'patientID' : Number(patientID)});
    }
    return Patients.findOne();
    // return dummy_patient;
  },
   patients() {
    // return Patients.find({});
    return Patients.find({}, {sort : {'lastName':1, 'firstName' : 1} });
  },
  calc_age() {
//calculate age. See http://stackoverflow.com/a/21984136/3961519
	if (this.birthDate == undefined)
	return '' ;

  	const ageDifMs = Date.now() - this.birthDate.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  ,hasAllergies () {
  	return patientHasAllergies(this);
  }
  ,noAllergies(){
  	return !patientHasAllergies(this);
  }

  // returns a patient assesment base on their metrics
  // this function returns a JSON object with 
  //  - color : background color to display in the UI: 
  //		Healthy green : textcolor: '#0f3d0f, backgroundcolor : '#33cc33', 
  //		Alert Yellow  : textcolor: #8a6d3b,  backgroundcolor: #ffff00;
  //		Danger Red    : textcolor: #fff, 	 backgroundcolor: #ff0000;
  //		Info blue     : textcolor: #31708f;  backgroundcolor: #d9edf7;
  //  - message : message to display to the clinical staff
  ,patientAssesment() {
  	return {
  		backgroundcolor : '#33cc33', 
  		textcolor: '#0f3d0f',
  		// alert : 'alert-danger',
  		message : 'Patient OK',
  		status : 'Healthy' // healthy, alert, danger, info.
  	}
  }

});


// Auxiliarify function to reuse functionality. 
// returns 'true' if the patient has allergies
// (the parameter patient object has an allergies field and its content is not 'none')
patientHasAllergies = function(patient){
	if (patient === undefined || patient.allergies === undefined)
  		return false;
  	if (patient.allergies == null || patient.allergies.trim() === '' || patient.allergies === 'none')
  		return false;

  	return true;
}


Template.patient_info.events({
	 "change #patient-select": function (event, template) {
        var patientID = template.$(event.currentTarget).val();
        template.state.set('patientID', patientID);
        // console.log(patientID);
    }

});

Template.patient_info.onCreated(function piOnCreated() {
  Meteor.subscribe('patients_demo');
  this.state = new ReactiveDict();

});