export interface PendingAction {
  id: string;
  type: 'meal_log' | 'goal_update' | 'meal_suggestion';
  data: any;
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface MealConfirmation {
  items: Array<{
    name: string;
    quantity: string;
    unit: string;
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  eatingTime: string; // Will be asked by AI
  confidence: number;
}

class ConfirmationService {
  private pendingActions: PendingAction[] = [];

  // Add a pending action that requires user confirmation
  addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'status'>): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pendingAction: PendingAction = {
      ...action,
      id,
      timestamp: new Date(),
      status: 'pending'
    };
    
    this.pendingActions.push(pendingAction);
    return id;
  }

  // Get pending actions
  getPendingActions(): PendingAction[] {
    return this.pendingActions.filter(action => action.status === 'pending');
  }

  // Confirm an action
  confirmAction(actionId: string): PendingAction | null {
    const action = this.pendingActions.find(a => a.id === actionId);
    if (action) {
      action.status = 'confirmed';
      return action;
    }
    return null;
  }

  // Reject an action
  rejectAction(actionId: string): PendingAction | null {
    const action = this.pendingActions.find(a => a.id === actionId);
    if (action) {
      action.status = 'rejected';
      return action;
    }
    return null;
  }

  // Clear old actions (cleanup)
  clearOldActions(olderThan: number = 30 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan;
    this.pendingActions = this.pendingActions.filter(
      action => action.timestamp.getTime() > cutoff
    );
  }

  // Generate confirmation message for AI to send
  generateConfirmationMessage(mealData: MealConfirmation, userMessage: string): string {
    const itemsList = mealData.items
      .map(item => `${item.quantity}${item.unit} of ${item.name}`)
      .join(', ');
    
    const totalCalories = mealData.items.reduce((sum, item) => sum + item.macros.calories, 0);
    
    const mealTimePrompt = mealData.eatingTime 
      ? `at ${mealData.eatingTime}` 
      : "- what time did you eat this?";

    return `Perfect! Let me make sure I have this right 📝

You had ${itemsList} for ${mealData.mealType} ${mealTimePrompt}

That's about ${totalCalories} calories total. Should I add this to your nutrition tracker? 

Reply "yes" to confirm or let me know if I need to adjust anything! 😊`;
  }

  // Check if meal data needs time confirmation
  needsTimeConfirmation(mealData: MealConfirmation): boolean {
    return !mealData.eatingTime || mealData.eatingTime.trim() === '';
  }
}

export const confirmationService = new ConfirmationService();