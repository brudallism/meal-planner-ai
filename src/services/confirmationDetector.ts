export interface ConfirmationResult {
  isConfirmation: boolean;
  isRejection: boolean;
  confidence: number;
  type: 'confirm' | 'reject' | 'modify' | 'unclear';
}

// Patterns that indicate user confirmation
const CONFIRMATION_PATTERNS = [
  /\b(yes|yep|yeah|correct|right|add it|log it|that's right|sounds good|perfect|exactly)\b/i,
  /\b(go ahead|do it|sure|okay|ok|looks good|that works)\b/i,
  /^(y|yes|yep|✓|👍)$/i,
];

// Patterns that indicate user rejection
const REJECTION_PATTERNS = [
  /\b(no|nope|wrong|incorrect|don't|don't add|not right|cancel)\b/i,
  /\b(never mind|nevermind|skip|ignore|delete|remove)\b/i,
  /^(n|no|nope|❌|👎)$/i,
];

// Patterns that indicate user wants to modify
const MODIFICATION_PATTERNS = [
  /\b(actually|but|however|change|different|more|less|instead)\b/i,
  /\b(it was|i had|make it|should be|not)\b/i,
];

export const detectConfirmation = (message: string): ConfirmationResult => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for confirmation patterns
  const confirmationMatches = CONFIRMATION_PATTERNS.filter(pattern => 
    pattern.test(lowerMessage)
  ).length;
  
  // Check for rejection patterns
  const rejectionMatches = REJECTION_PATTERNS.filter(pattern => 
    pattern.test(lowerMessage)
  ).length;
  
  // Check for modification patterns
  const modificationMatches = MODIFICATION_PATTERNS.filter(pattern => 
    pattern.test(lowerMessage)
  ).length;
  
  // Determine result type and confidence
  let type: 'confirm' | 'reject' | 'modify' | 'unclear' = 'unclear';
  let confidence = 0;
  
  if (confirmationMatches > 0 && rejectionMatches === 0) {
    type = 'confirm';
    confidence = Math.min(confirmationMatches * 0.4, 0.9);
  } else if (rejectionMatches > 0 && confirmationMatches === 0) {
    type = 'reject';
    confidence = Math.min(rejectionMatches * 0.4, 0.9);
  } else if (modificationMatches > 0) {
    type = 'modify';
    confidence = Math.min(modificationMatches * 0.3, 0.8);
  } else if (lowerMessage.length < 10 && (confirmationMatches > 0 || rejectionMatches > 0)) {
    // Short messages with clear intent get higher confidence
    type = confirmationMatches > rejectionMatches ? 'confirm' : 'reject';
    confidence = 0.8;
  }
  
  return {
    isConfirmation: type === 'confirm' && confidence > 0.6,
    isRejection: type === 'reject' && confidence > 0.6,
    confidence,
    type
  };
};


// Get the most recent pending meal confirmation
export const getLatestPendingMeal = (service: any) => {
  const pending = service.getPendingActions();
  const mealActions = pending.filter((action: any) => action.type === 'meal_log');
  return mealActions.length > 0 ? mealActions[mealActions.length - 1] : null;
};