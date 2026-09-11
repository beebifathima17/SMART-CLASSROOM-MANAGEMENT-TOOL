import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-quiz',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, IconComponent],
  templateUrl: './create-quiz.component.html',
  styleUrls: ['./create-quiz.component.css']
})
export class CreateQuizComponent {
  private fb = inject(FormBuilder);
  private quizService = inject(QuizService);
  private authService = inject(AuthService);
  private classroomService = inject(ClassroomService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected String = String;
  protected Math = Math;

  quizForm: FormGroup;

  constructor() {
    this.quizForm = this.fb.group({
      title: ['Angular Reactive Forms & Signals Assessment', [Validators.required, Validators.minLength(4)]],
      description: ['Comprehensive evaluation of Angular component architecture, form validation, and reactive primitives.', [Validators.required]],
      durationMinutes: [10, [Validators.required, Validators.min(1)]],
      shuffleQuestions: [false],
      showScoreAfterSubmission: [true],
      allowRetake: [true],
      questions: this.fb.array([])
    });

    // Seed 2 initial questions
    this.addQuestion('What is the key benefit of Angular Signals reactivity?', [
      'Automatic dependency tracking and fine-grained change detection',
      'It completely removes the need for HTML templates',
      'It compiles TypeScript directly into C++ binary',
      'It requires zone.js monkey-patching for all events'
    ], 0, 10);

    this.addQuestion('Which method updates a Writable Signal based on its previous value?', [
      'signal.set(newValue)',
      'signal.update(prev => prev + 1)',
      'signal.mutate(prev)',
      'signal.transform()'
    ], 1, 10);
  }

  get questionsArray(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('options') as FormArray;
  }

  addQuestion(
    defaultText: string = '',
    defaultOptions: string[] = ['Option A', 'Option B', 'Option C', 'Option D'],
    defaultCorrectIndex: number = 0,
    marks: number = 10
  ): void {
    const questionGroup = this.fb.group({
      questionText: [defaultText, Validators.required],
      marks: [marks, [Validators.required, Validators.min(1)]],
      correctOptionIndex: [defaultCorrectIndex, Validators.required],
      explanation: [''],
      options: this.fb.array(defaultOptions.map(opt => this.fb.control(opt, Validators.required)))
    });

    this.questionsArray.push(questionGroup);
  }

  removeQuestion(index: number): void {
    if (this.questionsArray.length <= 1) {
      this.toast.warning('A quiz must have at least 1 question.');
      return;
    }
    this.questionsArray.removeAt(index);
  }

  moveQuestion(index: number, direction: 'up' | 'down'): void {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.questionsArray.length) return;

    const currentGroup = this.questionsArray.at(index);
    this.questionsArray.removeAt(index);
    this.questionsArray.insert(targetIndex, currentGroup);
  }

  addOptionToQuestion(qIndex: number): void {
    const opts = this.getOptionsArray(qIndex);
    if (opts.length >= 6) {
      this.toast.warning('Maximum 6 options per question.');
      return;
    }
    opts.push(this.fb.control(`Option ${String.fromCharCode(65 + opts.length)}`, Validators.required));
  }

  removeOptionFromQuestion(qIndex: number, optIndex: number): void {
    const opts = this.getOptionsArray(qIndex);
    if (opts.length <= 2) {
      this.toast.warning('A question must have at least 2 choices.');
      return;
    }
    opts.removeAt(optIndex);
    // Reset correct index if out of bounds
    const qGroup = this.questionsArray.at(qIndex);
    if (qGroup.get('correctOptionIndex')?.value >= opts.length) {
      qGroup.patchValue({ correctOptionIndex: 0 });
    }
  }

  submitQuiz(isPublished: boolean): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      this.toast.error('Please complete all required fields and options.');
      return;
    }

    const val = this.quizForm.value;
    const activeClass = this.classroomService.activeClassroom();
    const currentUser = this.authService.currentUser();

    const formattedQuestions: QuizQuestion[] = val.questions.map((q: any, qIdx: number) => {
      const questionId = `q-${Date.now()}-${qIdx}`;
      const options = q.options.map((optText: string, oIdx: number) => ({
        id: `opt-${questionId}-${oIdx}`,
        text: optText
      }));

      const correctOptionId = options[q.correctOptionIndex]?.id || options[0].id;

      return {
        id: questionId,
        questionText: q.questionText,
        options,
        correctOptionId,
        marks: Number(q.marks),
        explanation: q.explanation || 'Refer to classroom lecture notes.'
      };
    });

    this.quizService.createQuiz({
      title: val.title,
      description: val.description,
      subject: activeClass.subject,
      classroomId: activeClass.id,
      durationMinutes: Number(val.durationMinutes),
      totalQuestions: formattedQuestions.length,
      totalMarks: formattedQuestions.reduce((sum, q) => sum + q.marks, 0),
      questions: formattedQuestions,
      status: isPublished ? 'published' : 'draft',
      settings: {
        shuffleQuestions: val.shuffleQuestions,
        showScoreAfterSubmission: val.showScoreAfterSubmission,
        allowRetake: val.allowRetake,
        timeLimitMinutes: Number(val.durationMinutes)
      },
      teacherId: currentUser?.id || `tea-${Date.now()}`,
      teacherName: currentUser?.name || 'Faculty Instructor'
    });

    this.router.navigate(['/teacher/dashboard']);
  }
}
