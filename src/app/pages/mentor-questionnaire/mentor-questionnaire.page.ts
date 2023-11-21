import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { MENTOR_QUESTIONNAIRE } from 'src/app/core/constants/formConstant';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-questionnaire',
  templateUrl: './mentor-questionnaire.page.html',
  styleUrls: ['./mentor-questionnaire.page.scss'],
})
export class MentorQuestionnairePage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  formData:any;
  public headerConfig: any = {
    notification: false,
    backButton: {
      label: 'BECOME_A_MENTOR',
    },
  };
  entityNames:any;
  showForm: boolean=false;

  constructor(private toast: ToastService, private router: Router, private organisation: OrganisationService, private form: FormService, private localStorage: LocalStorageService) {}

  async ngOnInit() {
    let form = await this.form.getForm(MENTOR_QUESTIONNAIRE)
    this.formData = _.get(form, 'data.fields');
    this.entityNames = await this.form.getEntityNames(this.formData)
    this.prefillData(await this.localStorage.getLocalData(localKeys.USER_DETAILS))
  }

  async prefillData(userDetails: any) {
    let existingData = userDetails;
    if(userDetails?.about){
       existingData = await this.form.formatEntityOptions(userDetails,this.entityNames)
    }
    for (let i = 0; i < this.formData.controls.length; i++) {
      this.formData.controls[i].value = existingData[this.formData.controls[i].name] ? existingData[this.formData.controls[i].name] : '';
      this.formData.controls[i].options = _.unionBy(
        this.formData.controls[i].options,
        this.formData.controls[i].value,
        'value'
      );
    }
    this.showForm = true;
  }

  async RequestToBecomeMentor(){
    if(this.form1.myForm.valid){
      let role = await this.organisation.getRequestedRoleDetails('mentor');
      let data = await this.organisation.requestOrgRole(role.id,this.form1.myForm.value)
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
    } else {
      this.toast.showToast("Please fill all the fields", "danger")
    }
  }

}
