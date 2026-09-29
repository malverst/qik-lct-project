export type PetStage = 'kitten' | 'teen' | 'adult';

export type CoatColorId = 'orange' | 'gray' | 'white';

export type AccessoryKind = 'shirt' | 'hat' | 'trinket';

export type AccessoryId = string;

export type PetCustomization = {
  coatColor: CoatColorId;
  shirtId: AccessoryId;
  hatId: AccessoryId;
  trinketId: AccessoryId;
};

export type PetState = {
  name: string;
  customization: PetCustomization;
  stage: PetStage;
  level: number;
  growthPoints: number;
  mood: number;
  hunger: number;
  energy: number;
  tasksSinceMeal: number;
  needsMeal: boolean;
};

export type BudgetPlan = {
  mandatory: number;
  optional: number;
  savings: number;
};

export type BudgetFact = {
  mandatorySpent: number;
  optionalSpent: number;
  saved: number;
  foodBought: boolean;
};

export type PeriodStatus = 'planning' | 'active' | 'review' | 'closed';

export type Period = {
  index: number;
  status: PeriodStatus;
  startingBudget: number;
  plan: BudgetPlan | null;
  fact: BudgetFact;
  goalId: string | null;
};

export type Wallet = {
  coins: number;
  savings: number;
};

export type CoinReason = 'start-budget' | 'purchase' | 'task' | 'food-help';

export type LearningProgress = {
  doneTaskIds: string[];
  ownedGoalIds: string[];
};

export type PeriodRecord = {
  index: number;
  plan: BudgetPlan;
  fact: BudgetFact;
  goalId: string;
  goalName: string;
  note: string;
};

export type Profile = {
  id: string;
  isDemo: boolean;
};

export type GameState = {
  profile: Profile;
  pet: PetState;
  wallet: Wallet;
  period: Period;
  currentGoalId: string | null;
  progress: LearningProgress;
  history: PeriodRecord[];
  purchasedItemIds: string[];
  savingsIntroSeen: boolean;
  restAvailableAt: number | null;
  pendingLevel: number | null;
};

export type CreatePetInput = {
  petName: string;
  customization: PetCustomization;
};
