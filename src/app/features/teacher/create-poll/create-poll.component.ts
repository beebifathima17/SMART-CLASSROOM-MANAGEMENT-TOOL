import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PollService } from '../../../core/services/poll.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { PollType } from '../../../core/models/poll.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-poll',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconComponent],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private authService = inject(AuthService);
  private classroomService = inject(ClassroomService);
  private toast = inject(ToastService);
  private router = inject(Router);

  pollForm: FormGroup;

  pollTypes: { label: string; value: PollType; icon: string; desc: string }[] = [
    { label: 'Multiple Choice', value: 'multiple_choice', icon: 'poll', desc: 'Single or multiple options' },
    { label: 'Yes / No Check', value: 'yes_no', icon: 'check', desc: 'Binary consensus check' },
    { label: '1-5 Star Rating', value: 'rating', icon: 'star', desc: 'Clarity or pacing scale' },
    { label: 'Open Feedback', value: 'open_text', icon: 'edit-3', desc: 'Free-form student thoughts' }
  ];

  constructor() {
    this.pollForm = this.fb.group({
      title: ['Lecture 12 Topic Checkpoint', [Validators.required, Validators.minLength(3)]],
      question: ['Which aspect of Angular Signals is most challenging to understand?', [Validators.required, Validators.minLength(5)]],
      type: ['multiple_choice' as PollType, [Validators.required]],
      options: this.fb.array([
        this.fb.control('Writable Signals (signal.set / update)', Validators.required),
        this.fb.control('Computed Derived Signals (computed)', Validators.required),
        this.fb.control('Effects & Reactive Side-effects', Validators.required),
        this.fb.control('RxJS to Signal Interop (toSignal)', Validators.required)
      ]),
      allowMultipleAnswers: [false],
      isAnonymous: [false],
      showResultsToStudents: [true],
      timeLimitSeconds: [90]
    });
  }

  get optionsArray(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  onTypeChange(type: PollType): void {
    this.pollForm.patchValue({ type });

    // Adjust options accordingly
    this.optionsArray.clear();
    if (type === 'multiple_choice') {
      this.optionsArray.push(this.fb.control('Option 1', Validators.required));
      this.optionsArray.push(this.fb.control('Option 2', Validators.required));
      this.optionsArray.push(this.fb.control('Option 3', Validators.required));
    } else if (type === 'yes_no') {
      this.optionsArray.push(this.fb.control('Yes, totally clear'));
      this.optionsArray.push(this.fb.control('No, need explanation'));
    } else if (type === 'rating') {
      this.optionsArray.push(this.fb.control('1 Star'));
      this.optionsArray.push(this.fb.control('2 Stars'));
      this.optionsArray.push(this.fb.control('3 Stars'));
      this.optionsArray.push(this.fb.control('4 Stars'));
      this.optionsArray.push(this.fb.control('5 Stars'));
    }
  }

  addOption(): void {
    if (this.optionsArray.length >= 6) {
      this.toast.warning('Maximum 6 options allowed per poll.');
      return;
    }
    this.optionsArray.push(this.fb.control(`Option ${this.optionsArray.length + 1}`, Validators.required));
  }

  removeOption(index: number): void {
    if (this.optionsArray.length <= 2) {
      this.toast.warning('A multiple-choice poll requires at least 2 options.');
      return;
    }
    this.optionsArray.removeAt(index);
  }

  submitPoll(isLive: boolean): void {
    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      this.toast.error('Please fix the required form fields.');
      return;
    }

    const val = this.pollForm.value;
    const activeClass = this.classroomService.activeClassroom();
    const currentUser = this.authService.currentUser();

    const formattedOptions = (val.type === 'multiple_choice' || val.type === 'yes_no' || val.type === 'rating')
      ? val.options.map((optText: string, idx: number) => ({
          id: `opt-${Date.now()}-${idx}`,
          text: optText,
          votes: 0,
          percentage: 0
        }))
      : [];

    const createdPoll = this.pollService.createPoll({
      classroomId: activeClass.id,
      title: val.title,
      question: val.question,
      type: val.type,
      options: formattedOptions,
      status: isLive ? 'active' : 'draft',
      allowMultipleAnswers: val.allowMultipleAnswers,
      isAnonymous: val.isAnonymous,
      showResultsToStudents: val.showResultsToStudents,
      timeLimitSeconds: Number(val.timeLimitSeconds),
      teacherId: currentUser?.id || `tea-${Date.now()}`,
      teacherName: currentUser?.name || 'Faculty Instructor',
      subject: activeClass.subject
    });

    if (isLive) {
      this.router.navigate(['/teacher/polls/live']);
    } else {
      this.router.navigate(['/teacher/dashboard']);
    }
  }
}
