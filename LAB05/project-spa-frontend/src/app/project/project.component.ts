import { Component } from '@angular/core';
// Import for dependency injection
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent {
  projects: any; // variable to store the projects data for the UI
  // Variables to hold the project data for the form temporarily while I save or update
  // Input will fields map to these variables via Forms Module
  _id!: string; // empty when creating, has value when updating
  name!: any;
  dueDate!:  any;
  course!:  any;


  // Dependency Injection via Constructor Method
  // This is the service declared in the providers list in the app.module.ts file
  constructor(private projectService: ProjectService) {}

  // Lifecycle hook to call the service when the component is initialized
  ngOnInit(): void {
    this.getProjects();
  }

  // Method to call the service
  getProjects(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
    });
  }
 //Create new project
 addProject(): void {
  //create a new project object using the information in the form fields
 let newProject={
    name:this.name,
    dueDate:this.dueDate,
  course:this.course,

  }

  //call the service and pass the new project object

  
this.projectService.addProject(newProject).subscribe(response=>{
  this.getProjects(); //refresh the list
 });
  //clear form
  this.clearForm();
}
deleteProject(-id:any):void{
 if(confirm('Are you sure you want to delete this project?')){
  this.projectService.deleteProject(-id).subscribe(response=>{
    this.getProjects(); //refresh the list
  })
}
}

  clearForm():void{
    this.name='';
    this.dueDate='';
    this.course='';
  }
 }
