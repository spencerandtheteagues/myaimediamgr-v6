import { 
  type User, type InsertUser, type UpsertUser,
  type Platform, type InsertPlatform, 
  type Post, type InsertPost, 
  type AiSuggestion, type InsertAiSuggestion, 
  type Analytics, type InsertAnalytics, 
  type Campaign, type InsertCampaign,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type UserSubscription, type InsertUserSubscription,
  type CreditTransaction, type InsertCreditTransaction,
  type UsageTracking, type InsertUsageTracking
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserCredits(userId: string, creditChange: number, description: string, type: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  
  // Platforms
  getPlatformsByUserId(userId: string): Promise<Platform[]>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform | undefined>;
  
  // Campaigns
  getCampaignsByUserId(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  // Posts
  getPostsByUserId(userId: string): Promise<Post[]>;
  getPostsByStatus(userId: string, status: string): Promise<Post[]>;
  getPostsByCampaignId(campaignId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // AI Suggestions
  getAiSuggestionsByUserId(userId: string): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  
  // Analytics
  getAnalyticsByUserId(userId: string): Promise<Analytics[]>;
  getAnalyticsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined>;
  
  // Credit Transactions
  getCreditTransactionsByUserId(userId: string): Promise<CreditTransaction[]>;
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  
  // Usage Tracking
  getUsageByUserId(userId: string): Promise<UsageTracking[]>;
  createUsageTracking(usage: InsertUsageTracking): Promise<UsageTracking>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private platforms: Map<string, Platform>;
  private campaigns: Map<string, Campaign>;
  private posts: Map<string, Post>;
  private aiSuggestions: Map<string, AiSuggestion>;
  private analytics: Map<string, Analytics>;
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private userSubscriptions: Map<string, UserSubscription>;
  private creditTransactions: Map<string, CreditTransaction>;
  private usageTracking: Map<string, UsageTracking>;

  constructor() {
    this.users = new Map();
    this.platforms = new Map();
    this.campaigns = new Map();
    this.posts = new Map();
    this.aiSuggestions = new Map();
    this.analytics = new Map();
    this.subscriptionPlans = new Map();
    this.userSubscriptions = new Map();
    this.creditTransactions = new Map();
    this.usageTracking = new Map();
    
    // Initialize with demo user and data
    this.initializeDemoData();
    this.initializeSubscriptionPlans();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40&fit=crop",
      businessName: "Sarah's Corner Café",
      credits: 500, // Start with 500 free credits
      subscriptionId: "starter",
      subscriptionStatus: "active",
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      totalCreditsUsed: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null,
      isAdmin: false,
      adminPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create connected platforms
    const platforms: Platform[] = [
      {
        id: randomUUID(),
        name: "Instagram",
        icon: "fab fa-instagram",
        color: "#E1306C",
        isConnected: true,
        userId: demoUser.id,
        accountId: "cafe_instagram",
        accessToken: "ig_token_123",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Facebook",
        icon: "fab fa-facebook",
        color: "#1877F2",
        isConnected: true,
        userId: demoUser.id,
        accountId: "cafe_facebook",
        accessToken: "fb_token_123",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "X (Twitter)",
        icon: "fab fa-twitter",
        color: "#1DA1F2",
        isConnected: true,
        userId: demoUser.id,
        accountId: "cafe_twitter",
        accessToken: "twitter_token_123",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "TikTok",
        icon: "fab fa-tiktok",
        color: "#000000",
        isConnected: true,
        userId: demoUser.id,
        accountId: "cafe_tiktok",
        accessToken: "tiktok_token_123",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "LinkedIn",
        icon: "fab fa-linkedin",
        color: "#0A66C2",
        isConnected: true,
        userId: demoUser.id,
        accountId: "cafe_linkedin",
        accessToken: "linkedin_token_123",
        createdAt: new Date(),
      },
    ];

    platforms.forEach(platform => this.platforms.set(platform.id, platform));

    // Create sample posts
    const posts: Post[] = [
      {
        id: randomUUID(),
        userId: demoUser.id,
        campaignId: null,
        content: "🥞 Weekend brunch is here! Join us for fluffy pancakes, fresh fruit, and the best coffee in town. Perfect way to start your Saturday! #WeekendBrunch #CafeLife #FreshEats",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1080&fit=crop",
        videoUrl: null,
        imagePrompt: null,
        videoPrompt: null,
        platforms: ["Facebook", "Instagram"],
        status: "pending",
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        publishedAt: null,
        mediaUrls: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&h=1080&fit=crop"],
        aiGenerated: true,
        approvedBy: null,
        rejectionReason: null,
        engagementData: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: demoUser.id,
        campaignId: null,
        content: "☕ Coffee Tip Tuesday: Did you know that grinding your coffee beans right before brewing preserves the oils and gives you the freshest flavor? Try it and taste the difference! #CoffeeTips #FreshBrew",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1080&h=1080&fit=crop",
        videoUrl: null,
        imagePrompt: null,
        videoPrompt: null,
        platforms: ["X (Twitter)", "LinkedIn"],
        status: "pending",
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        publishedAt: null,
        mediaUrls: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1080&h=1080&fit=crop"],
        aiGenerated: false,
        approvedBy: null,
        rejectionReason: null,
        engagementData: null,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: demoUser.id,
        campaignId: null,
        content: "✨ Watch our skilled barista create the perfect latte art! Each cup is crafted with love and precision. What's your favorite latte art design? 🎨☕ #LatteArt #BehindTheScenes #CoffeeArt",
        imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1080&h=1080&fit=crop",
        videoUrl: null,
        imagePrompt: null,
        videoPrompt: null,
        platforms: ["Instagram"],
        status: "pending",
        scheduledFor: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        publishedAt: null,
        mediaUrls: ["https://example.com/latte-art-video.mp4"],
        aiGenerated: true,
        approvedBy: null,
        rejectionReason: null,
        engagementData: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: demoUser.id,
        campaignId: null,
        content: "☕ Start your Monday with our signature blend! What's your go-to morning coffee order? #MondayMotivation #CoffeeLovers",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&h=1080&fit=crop",
        videoUrl: null,
        imagePrompt: null,
        videoPrompt: null,
        platforms: ["Instagram", "Facebook", "X (Twitter)"],
        status: "published",
        scheduledFor: null,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        mediaUrls: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&h=1080&fit=crop"],
        aiGenerated: true,
        approvedBy: null,
        rejectionReason: null,
        engagementData: {
          likes: 324,
          comments: 45,
          shares: 12,
          clicks: 89,
          reach: 1580,
        },
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    posts.forEach(post => this.posts.set(post.id, post));
  }

  private initializeSubscriptionPlans() {
    const plans: SubscriptionPlan[] = [
      {
        id: "free",
        name: "free",
        displayName: "Free Trial",
        monthlyPrice: "0.00",
        yearlyPrice: "0.00",
        creditsPerMonth: 50,
        features: [
          "50 credits per month",
          "Basic AI content generation",
          "2 social media platforms",
          "Basic analytics"
        ],
        maxPlatforms: 2,
        analyticsAccess: true,
        aiSuggestions: true,
        prioritySupport: false,
        teamMembers: 1,
        videoGeneration: false,
        createdAt: new Date(),
      },
      {
        id: "starter",
        name: "starter",
        displayName: "Starter",
        monthlyPrice: "29.00",
        yearlyPrice: "290.00",
        creditsPerMonth: 500,
        features: [
          "500 credits per month",
          "Advanced AI content generation",
          "5 social media platforms",
          "Detailed analytics",
          "Image generation (10 per month)",
          "Priority email support"
        ],
        maxPlatforms: 5,
        analyticsAccess: true,
        aiSuggestions: true,
        prioritySupport: true,
        teamMembers: 1,
        videoGeneration: false,
        createdAt: new Date(),
      },
      {
        id: "professional",
        name: "professional",
        displayName: "Professional",
        monthlyPrice: "99.00",
        yearlyPrice: "990.00",
        creditsPerMonth: 2000,
        features: [
          "2,000 credits per month",
          "Premium AI content generation",
          "Unlimited social media platforms",
          "Advanced analytics & reporting",
          "Image generation (50 per month)",
          "Video generation (5 per month)",
          "Priority phone & email support",
          "3 team members"
        ],
        maxPlatforms: 999,
        analyticsAccess: true,
        aiSuggestions: true,
        prioritySupport: true,
        teamMembers: 3,
        videoGeneration: true,
        createdAt: new Date(),
      },
      {
        id: "enterprise",
        name: "enterprise",
        displayName: "Enterprise",
        monthlyPrice: "299.00",
        yearlyPrice: "2990.00",
        creditsPerMonth: 10000,
        features: [
          "10,000 credits per month",
          "Enterprise AI features",
          "Unlimited everything",
          "Custom analytics dashboards",
          "Unlimited image generation",
          "Video generation (50 per month)",
          "Dedicated account manager",
          "24/7 priority support",
          "Unlimited team members",
          "API access",
          "Custom integrations"
        ],
        maxPlatforms: 999,
        analyticsAccess: true,
        aiSuggestions: true,
        prioritySupport: true,
        teamMembers: 999,
        videoGeneration: true,
        createdAt: new Date(),
      },
    ];

    plans.forEach(plan => this.subscriptionPlans.set(plan.id, plan));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      businessName: insertUser.businessName ?? null,
      credits: insertUser.credits ?? 50,
      subscriptionId: insertUser.subscriptionId ?? "free",
      subscriptionStatus: insertUser.subscriptionStatus ?? "free",
      subscriptionEndDate: insertUser.subscriptionEndDate ?? null,
      totalCreditsUsed: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null,
      isAdmin: false,
      adminPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(upsertUser: UpsertUser): Promise<User> {
    // Check if user exists
    const existingUser = upsertUser.id ? await this.getUser(upsertUser.id) : null;
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        ...upsertUser,
        updatedAt: new Date(),
      };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const id = upsertUser.id || randomUUID();
      const newUser: User = {
        id,
        email: upsertUser.email ?? null,
        firstName: upsertUser.firstName ?? null,
        lastName: upsertUser.lastName ?? null,
        profileImageUrl: upsertUser.profileImageUrl ?? null,
        businessName: upsertUser.businessName ?? null,
        credits: upsertUser.credits ?? 50,
        subscriptionId: upsertUser.subscriptionId ?? "free",
        subscriptionStatus: upsertUser.subscriptionStatus ?? "free",
        subscriptionEndDate: upsertUser.subscriptionEndDate ?? null,
        totalCreditsUsed: upsertUser.totalCreditsUsed ?? 0,
        stripeCustomerId: upsertUser.stripeCustomerId ?? null,
        stripeSubscriptionId: upsertUser.stripeSubscriptionId ?? null,
        trialEndsAt: upsertUser.trialEndsAt ?? null,
        isAdmin: upsertUser.isAdmin ?? false,
        adminPassword: upsertUser.adminPassword ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(id, newUser);
      return newUser;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserCredits(userId: string, creditChange: number, description: string, type: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newCredits = user.credits + creditChange;
    const updatedUser = {
      ...user,
      credits: newCredits,
      totalCreditsUsed: creditChange < 0 ? user.totalCreditsUsed + Math.abs(creditChange) : user.totalCreditsUsed,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);

    // Create credit transaction
    await this.createCreditTransaction({
      userId,
      amount: creditChange,
      balance: newCredits,
      type,
      description,
      metadata: null,
    });

    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Platforms
  async getPlatformsByUserId(userId: string): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(platform => platform.userId === userId);
  }

  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = randomUUID();
    const platform: Platform = {
      ...insertPlatform,
      id,
      isConnected: insertPlatform.isConnected ?? null,
      userId: insertPlatform.userId ?? null,
      accountId: insertPlatform.accountId ?? null,
      accessToken: insertPlatform.accessToken ?? null,
      createdAt: new Date(),
    };
    this.platforms.set(id, platform);
    return platform;
  }

  async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform | undefined> {
    const platform = this.platforms.get(id);
    if (!platform) return undefined;
    
    const updatedPlatform = { ...platform, ...updates };
    this.platforms.set(id, updatedPlatform);
    return updatedPlatform;
  }

  // Campaigns
  async getCampaignsByUserId(userId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      keyMessages: insertCampaign.keyMessages ?? [],
      generationProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Posts
  async getPostsByUserId(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPostsByStatus(userId: string, status: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId && post.status === status)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPostsByCampaignId(campaignId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.campaignId === campaignId)
      .sort((a, b) => {
        // Sort by scheduledFor date if available, otherwise by createdAt
        const dateA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt!);
        const dateB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt!);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      publishedAt: null,
      mediaUrls: insertPost.mediaUrls ?? [],
      approvedBy: null,
      rejectionReason: null,
      engagementData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // AI Suggestions
  async getAiSuggestionsByUserId(userId: string): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = randomUUID();
    const suggestion: AiSuggestion = {
      id,
      userId: insertSuggestion.userId,
      prompt: insertSuggestion.prompt,
      suggestions: insertSuggestion.suggestions,
      selected: insertSuggestion.selected ?? null,
      createdAt: new Date(),
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  // Analytics
  async getAnalyticsByUserId(userId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAnalyticsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => 
        analytics.userId === userId &&
        new Date(analytics.date) >= startDate &&
        new Date(analytics.date) <= endDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      createdAt: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  // User Subscriptions
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    return Array.from(this.userSubscriptions.values())
      .find(sub => sub.userId === userId && sub.status === "active");
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = randomUUID();
    const userSub: UserSubscription = {
      ...subscription,
      id,
      createdAt: new Date(),
    };
    this.userSubscriptions.set(id, userSub);
    return userSub;
  }

  async updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const subscription = this.userSubscriptions.get(id);
    if (!subscription) return undefined;
    
    const updated = { ...subscription, ...updates };
    this.userSubscriptions.set(id, updated);
    return updated;
  }

  // Credit Transactions
  async getCreditTransactionsByUserId(userId: string): Promise<CreditTransaction[]> {
    return Array.from(this.creditTransactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const id = randomUUID();
    const creditTx: CreditTransaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.creditTransactions.set(id, creditTx);
    return creditTx;
  }

  // Usage Tracking
  async getUsageByUserId(userId: string): Promise<UsageTracking[]> {
    return Array.from(this.usageTracking.values())
      .filter(u => u.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createUsageTracking(usage: InsertUsageTracking): Promise<UsageTracking> {
    const id = randomUUID();
    const usageTrack: UsageTracking = {
      ...usage,
      id,
      createdAt: new Date(),
    };
    this.usageTracking.set(id, usageTrack);
    return usageTrack;
  }
}

export const storage = new MemStorage();
