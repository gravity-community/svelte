/** Two-step confirm: the first `confirm()` arms, the second commits. */
export class ConfirmGesture {
  pending = $state(false);

  /** True when this call commits; false when it only armed the gesture. */
  confirm(): boolean {
    if (this.pending) {
      this.pending = false;
      return true;
    }
    this.pending = true;
    return false;
  }

  cancel(): void {
    this.pending = false;
  }
}
