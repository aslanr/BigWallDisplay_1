import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Patients } from '../api/patients.js';
import {Datasample_second} from '../api/patients.js';
import {Assesment} from '../api/patients.js';

import { patientHasAllergies } from '../api/demographic.js'
// import { temperature_color } from 'patient_info_ui.js'

import './patient_info.html';
import './patient_info.css';
// import './patient_info_ui.js';
const patient_tile_styles = require('./patient_info_ui.js');


// This dumy patient is just to represent the "empty template"
// meaning giving "fake" context data to the template
const dummy_patient = {
	"_id" : '000',
	"lastName" : "no name",
	"firstName" : "no name",
	"gender" : "?",
	"birthDate" : new Date(),
	"maritalStatus" : "?",
	"race" : "?",
	"allergies" : "none",
	"height" : 0,
	"weight" : 0
}


Template.patient_info.helpers({
  //returns the information of a single patient
   patient() {
   	//return a single patient for template data context
   	const instance = Template.instance();
    if (instance.state.get('patientID')) {//check patient that has been selected on the dropdown
      const patientID = instance.state.get('patientID');
      return Patients.findOne({'patientID' : patientID});
    }
    // return Patients.findOne();
    return dummy_patient;
  }
  //returns all patients
   ,patients() {
    // return Patients.find({});
    return Patients.find({}, {sort : {'lastName':1, 'firstName' : 1} });
  }
  ,datasamples(){
    const instance = Template.instance();
    let data = undefined
    if (instance.state.get('patientID')) {
        const patientID = instance.state.get('patientID');
        //find returns a cursor, so we need to use fetch, to convert to array. 
        // We are limiting to only one (the latest) sample --> array notation to get the object from the array
        data = Datasample_second.find({'patientID' : patientID} , {sort : {'timeStamp' : -1}, limit : 1}).fetch()[0];
    }

    if(data === undefined){
      const defaultObj = {
              temperature : '-'
            ,blood_pressure_sys : '-'
            ,blood_pressure_dias : '-'
            ,heart_rate : '-'
            ,spo2_sat : '-'
            ,pulse_rate : '-'
      }
      return defaultObj;
    }


    const temp_avg = data['Temperature'] === undefined  || data['Temperature'].count < 1 ? '-' : data['Temperature'].sum / data['Temperature'].count;
    const bp_sys_avg = data['NIBPSystolic'] === undefined || data['NIBPSystolic'].count < 1 ? '-' : data['NIBPSystolic'].sum / data['NIBPSystolic'].count;
    const bp_dias_avg = data['NIBPDiastolic'] === undefined  || data['NIBPDiastolic'].count < 1 ? '-' : data['NIBPDiastolic'].sum / data['NIBPDiastolic'].count;
    const hr_avg = data['ECGHeartRate'] === undefined || data['ECGHeartRate'].count < 1? '-' : data['ECGHeartRate'].sum / data['ECGHeartRate'].count;
    const spo2_avg = data['SpO2'] === undefined || data['SpO2'] .count < 1 ? '-' : data['SpO2'] .sum / data['SpO2'] .count;
    const pr_avg = data.SpO2PulseRate === undefined || data.SpO2PulseRate.count < 1 ? '-' : data.SpO2PulseRate.sum / data.SpO2PulseRate.count;

    const data_sample = {
      temperature : temp_avg
      ,blood_pressure_sys : bp_sys_avg
      ,blood_pressure_dias : bp_dias_avg
      ,heart_rate : hr_avg
      ,spo2_sat : spo2_avg
      ,pulse_rate : pr_avg
    }

    // console.log(data_sample)
    
    return data_sample;

  }

  ,calc_age() {
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

  ,getTemperatureColor(temperature){
// if (undefined != this.temperature) {}
    return patient_tile_styles.temperature_color(temperature);
  }

  // returns a patient assesment base on their metrics
  // this function returns a JSON object with 
  //  - color : background color to display in the UI: 
  //		Healthy green : textcolor: '#0f3d0f, backgroundcolor : '#47d147', 
  //		Alert Yellow  : textcolor: #8a6d3b,  backgroundcolor: #ffff00;
  //		Danger Red    : textcolor: #fff, 	 backgroundcolor: #ff0000;
  //		Info blue     : textcolor: #31708f;  backgroundcolor: #d9edf7;
  //  - message : message to display to the clinical staff
  ,patientAssesment() {
    let patientdata = undefined;
    const instance = Template.instance();
    if (instance.state.get('patientID')) {
        const patientID = instance.state.get('patientID');
        //find returns a cursor, so we need to use fetch, to convert to array. 
        // We are limiting to only one (the latest) sample --> array notation to get the object from the array
        patientdata = Datasample_second.find({'patientID' : patientID} , {sort : {'timeStamp' : -1}, limit : 1}).fetch()[0];
    }
    return patient_tile_styles.patient_assesment(patientdata);

  }

//returns the formated date of the latest assesment for this patient
  ,lastAssesment(){
    let lastestAssesment = {}// = "N.A.";
    let latest = undefined;
    const instance = Template.instance();
    if (instance.state.get('patientID')) {
        const patientID = instance.state.get('patientID');
        // lastDate = Assesment.find({'patientID' : Number(patientID)} , {sort : {'assement_date' : -1}, limit : 1}).fetch()[0];
        latest = Assesment.find({'patientID' : patientID}, {sort : {'assement_date' : -1}, limit : 1}).fetch()[0];
    }
    if(undefined != latest /*&& "N.A." != lastestAssesment*/){
      //using moment library to format date : https://atmospherejs.com/momentjs/moment
          // return moment(lastestAssesment.assement_date).format('MM/DD/YY HH:mm:ss');
                lastestAssesment.message =moment(latest.assement_date).format('MM/DD/YY HH:mm:ss');
      lastestAssesment.color = "label-success";
      return lastestAssesment;
    }else{
      lastestAssesment.message = "Not Available";
      lastestAssesment.color = "label-danger";
      return lastestAssesment;
    }
    
  }

//returns the color of the assesment label
  ,lastCheckedLableColor : function(){

  }

});


// // Auxiliarify function to reuse functionality. 
// // returns 'true' if the patient has allergies
// // (the parameter patient object has an allergies field and its content is not 'none')
// patientHasAllergies = function(patient){
// 	if (patient === undefined || patient.allergies === undefined)
//   		return false;
//   	if (patient.allergies == null || patient.allergies.trim() === '' || patient.allergies === 'none')
//   		return false;

//   	return true;
// }


Template.patient_info.events({
	 "change #patient-select": function (event, template) {
        var patientID = template.$(event.currentTarget).val();
        template.state.set('patientID', patientID);
        // console.log(patientID);
    }
    ,"click #assespatient" : function(){
      const patientID = Template.instance().state.get('patientID');
      // const now = Date.now();
      // console.log(patientID);

      // Insert an assesment into the collection
      if(patientID != undefined){
        Meteor.call('assesment.insert', patientID);
      }
         
    }

});


Template.patient_info.onCreated(function piOnCreated() {
  //subscriptions
  Meteor.subscribe('patients_demo');
  Meteor.subscribe('datasample_second');
  Meteor.subscribe('assesment');
  this.state = new ReactiveDict();

});