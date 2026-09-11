import { Injectable, signal } from '@angular/core';
import { Poll, PollOption, PollResponse, PollType } from '../models/poll.model';
import { ToastService } from './toast.service';

export const DEFAULT_POLLS: Poll[] = [];

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private pollsSignal = signal<Poll[]>([]);
  public readonly polls = this.pollsSignal.asReadonly();
  public readonly activePoll = signal<Poll | null>(null);
  public readonly studentAnsweredPolls = signal<Record<string, PollResponse>>({});

  private timerInterval: any = null;

  constructor(private toast: ToastService) {
    this.initPollStorage();
    this.listenToStorage();
    this.startActiveTimer();
  }

  private isDemoPoll(p: any): boolean {
    if (!p) return false;
    const id = p.id || '';
    const q = (p.question || '').toLowerCase();
    return (
      id === 'poll-101' ||
      id === 'poll-102' ||
      q.includes('most difficult topic') ||
      q.includes('dependency injection in angular')
    );
  }

  private initPollStorage(): void {
    const storedPolls = localStorage.getItem('smartclass_polls');
    let cleanPolls: Poll[] = [];
    if (storedPolls) {
      try {
        const parsed = JSON.parse(storedPolls);
        if (Array.isArray(parsed)) {
          cleanPolls = parsed.filter(p => !this.isDemoPoll(p));
        }
      } catch (e) {
        cleanPolls = [];
      }
    }
    this.pollsSignal.set(cleanPolls);
    const live = cleanPolls.find(p => p.status === 'active') || null;
    this.activePoll.set(live);
    localStorage.setItem('smartclass_polls', JSON.stringify(cleanPolls));

    const storedAnswers = localStorage.getItem('smartclass_student_poll_answers');
    if (storedAnswers) {
      try {
        this.studentAnsweredPolls.set(JSON.parse(storedAnswers));
      } catch (e) {}
    }
  }

  private resetPolls(): void {
    this.pollsSignal.set([]);
    this.activePoll.set(null);
    localStorage.setItem('smartclass_polls', JSON.stringify([]));
  }

  private listenToStorage(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'smartclass_polls' && event.newValue) {
        const parsed: Poll[] = JSON.parse(event.newValue);
        this.pollsSignal.set(parsed);
        const active = parsed.find(p => p.status === 'active') || null;
        this.activePoll.set(active);
      }
    });
  }

  private startActiveTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const current = this.activePoll();
      if (current && current.status === 'active' && current.secondsRemaining && current.secondsRemaining > 0) {
        const nextSeconds = current.secondsRemaining - 1;
        const updated = { ...current, secondsRemaining: nextSeconds };
        this.activePoll.set(updated);
        this.pollsSignal.update(list => list.map(p => p.id === current.id ? updated : p));
      }
    }, 1000);
  }

  createPoll(pollData: Omit<Poll, 'id' | 'createdAt' | 'totalResponses'>): Poll {
    const totalVotes = pollData.options.reduce((sum, o) => sum + (o.votes || 0), 0);
    const optionsWithPercentages = pollData.options.map(opt => ({
      ...opt,
      votes: opt.votes || 0,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
    }));

    // If launching as active, set previous active polls to draft/ended
    let currentList = this.pollsSignal();
    if (pollData.status === 'active') {
      currentList = currentList.map(p => p.status === 'active' ? { ...p, status: 'ended' } : p);
    }

    const newPoll: Poll = {
      ...pollData,
      id: `poll-${Date.now()}`,
      options: optionsWithPercentages,
      totalResponses: totalVotes,
      secondsRemaining: pollData.timeLimitSeconds || 90,
      createdAt: 'Just now'
    };

    const updatedList = [newPoll, ...currentList];
    this.pollsSignal.set(updatedList);
    localStorage.setItem('smartclass_polls', JSON.stringify(updatedList));

    if (newPoll.status === 'active') {
      this.activePoll.set(newPoll);
      this.toast.success(`Poll "${newPoll.title}" launched live!`, 'Poll Live');
    } else {
      this.toast.info(`Draft poll "${newPoll.title}" saved.`, 'Poll Draft');
    }

    return newPoll;
  }

  startPoll(pollId: string): void {
    const poll = this.pollsSignal().find(p => p.id === pollId);
    if (!poll) return;

    // Set other active polls to ended
    const updatedList = this.pollsSignal().map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          status: 'active' as const,
          secondsRemaining: p.secondsRemaining && p.secondsRemaining > 0 ? p.secondsRemaining : (p.timeLimitSeconds || 90)
        };
      }
      return p.status === 'active' ? { ...p, status: 'ended' as const } : p;
    });

    this.pollsSignal.set(updatedList);
    localStorage.setItem('smartclass_polls', JSON.stringify(updatedList));

    const active = updatedList.find(p => p.id === pollId) || null;
    this.activePoll.set(active);
    this.toast.success(`Poll "${poll.title}" is now LIVE for students!`, 'Poll Started');
  }

  pausePoll(pollId: string): void {
    this.updatePollField(pollId, { status: 'paused' });
    this.toast.warning('Poll paused.', 'Poll Paused');
  }

  resumePoll(pollId: string): void {
    this.updatePollField(pollId, { status: 'active' });
    this.toast.success('Poll resumed!', 'Poll Active');
  }

  endPoll(pollId: string): void {
    this.updatePollField(pollId, { status: 'ended', secondsRemaining: 0, endedAt: 'Just now' });
    this.toast.info('Poll ended. Final votes recorded.', 'Poll Completed');
  }

  toggleShareResults(pollId: string): void {
    const poll = this.pollsSignal().find(p => p.id === pollId);
    if (!poll) return;
    const newShare = !poll.showResultsToStudents;
    this.updatePollField(pollId, { showResultsToStudents: newShare });
    this.toast.info(`Live results sharing ${newShare ? 'enabled' : 'hidden'} for students.`);
  }

  submitVote(pollId: string, studentId: string, studentName: string, selectedOptionIds: string[], textAnswer?: string): boolean {
    const poll = this.pollsSignal().find(p => p.id === pollId);
    if (!poll) return false;

    // Increment selected options
    const updatedOptions = poll.options.map(opt => {
      if (selectedOptionIds.includes(opt.id)) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    const newTotal = updatedOptions.reduce((sum, o) => sum + o.votes, 0);
    const finalOptions = updatedOptions.map(opt => ({
      ...opt,
      percentage: newTotal > 0 ? Math.round((opt.votes / newTotal) * 100) : 0
    }));

    const updatedPoll: Poll = {
      ...poll,
      options: finalOptions,
      totalResponses: newTotal
    };

    const response: PollResponse = {
      id: `resp-${Date.now()}`,
      pollId,
      studentId,
      studentName,
      selectedOptionIds,
      textAnswer,
      submittedAt: 'Just now'
    };

    const updatedList = this.pollsSignal().map(p => p.id === pollId ? updatedPoll : p);
    this.pollsSignal.set(updatedList);
    localStorage.setItem('smartclass_polls', JSON.stringify(updatedList));

    if (this.activePoll()?.id === pollId) this.activePoll.set(updatedPoll);

    this.studentAnsweredPolls.update(map => {
      const updatedMap = { ...map, [pollId]: response };
      localStorage.setItem('smartclass_student_poll_answers', JSON.stringify(updatedMap));
      return updatedMap;
    });

    this.toast.success('Your vote has been counted in real time!', 'Vote Recorded');
    return true;
  }

  deletePoll(pollId: string): void {
    const poll = this.pollsSignal().find(p => p.id === pollId);
    const updated = this.pollsSignal().filter(p => p.id !== pollId);
    this.pollsSignal.set(updated);
    localStorage.setItem('smartclass_polls', JSON.stringify(updated));

    if (this.activePoll()?.id === pollId) {
      const nextActive = updated.find(p => p.status === 'active') || updated[0] || null;
      this.activePoll.set(nextActive);
    }

    this.toast.info(`Poll "${poll?.title || 'Poll'}" deleted successfully.`, 'Poll Deleted');
  }

  private updatePollField(pollId: string, fields: Partial<Poll>): void {
    const updatedList = this.pollsSignal().map(p => p.id === pollId ? { ...p, ...fields } : p);
    this.pollsSignal.set(updatedList);
    localStorage.setItem('smartclass_polls', JSON.stringify(updatedList));

    if (this.activePoll()?.id === pollId) {
      this.activePoll.update(curr => curr ? { ...curr, ...fields } : null);
    }
  }
}
