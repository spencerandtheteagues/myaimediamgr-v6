import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertAiSuggestionSchema, insertCampaignSchema } from "@shared/schema";
import { z } from "zod";
import * as gcloudAI from "./gcloud-ai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { registerStripeRoutes } from "./stripe-routes";
import { registerAdminRoutes } from "./admin-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  
  // Register admin routes
  registerAdminRoutes(app);
  
  // Register Stripe payment routes
  registerStripeRoutes(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user-1';
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user (fallback for old API)
  app.get("/api/user", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscription plans" });
    }
  });

  // Subscribe to a plan
  app.post("/api/subscribe/:planId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user-1';
      const { planId } = req.params;
      const plan = await storage.getSubscriptionPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Update user subscription
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create subscription record
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      await storage.createUserSubscription({
        userId,
        planId,
        status: "active",
        billingCycle: "monthly",
        startDate: new Date(),
        endDate,
        nextBillingDate: endDate,
        autoRenew: true,
        cancelledAt: null,
      });

      // Update user with new subscription and add credits
      await storage.updateUserCredits(
        userId,
        plan.creditsPerMonth,
        `Subscription to ${plan.displayName} plan`,
        "subscription"
      );

      res.json({ message: "Subscription successful", plan });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(500).json({ message: "Failed to subscribe to plan" });
    }
  });

  // Get user's credit transactions
  app.get("/api/credits/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user-1';
      const transactions = await storage.getCreditTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get credit transactions" });
    }
  });

  // Get user's usage tracking
  app.get("/api/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'demo-user-1';
      const usage = await storage.getUsageByUserId(userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: "Failed to get usage data" });
    }
  });

  // Get user's connected platforms
  app.get("/api/platforms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const platforms = await storage.getUserPlatforms(userId);
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ message: "Failed to get platforms" });
    }
  });

  // Connect a platform
  app.post("/api/platforms/:platformId/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const { platformId } = req.params;
      const { accessToken, refreshToken, scope, platformUserId, platformUsername } = req.body;
      
      const platform = await storage.connectPlatform(userId, {
        platformId,
        accessToken,
        refreshToken,
        scope,
        platformUserId,
        platformUsername,
      });
      
      res.json(platform);
    } catch (error) {
      console.error("Error connecting platform:", error);
      res.status(500).json({ message: "Failed to connect platform" });
    }
  });

  // Disconnect a platform
  app.delete("/api/platforms/:platformId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const { platformId } = req.params;
      
      await storage.disconnectPlatform(userId, platformId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      res.status(500).json({ message: "Failed to disconnect platform" });
    }
  });

  // OAuth callback handler (for production OAuth flows)
  app.get("/api/auth/:platform/callback", async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state } = req.query;
      
      // In production, this would exchange the code for access tokens
      // For now, redirect back to connect page with success
      res.redirect(`/connect-platforms?connected=${platform}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/connect-platforms?error=oauth_failed");
    }
  });

  // Get user's posts
  app.get("/api/posts", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const { status } = req.query;
      let posts;
      
      if (status && typeof status === "string") {
        posts = await storage.getPostsByStatus(userId, status);
      } else {
        posts = await storage.getPostsByUserId(userId);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  // Get campaigns
  app.get("/api/campaigns", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const campaigns = await storage.getCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaigns" });
    }
  });

  // Get campaign by ID
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaign" });
    }
  });

  // Get posts for a campaign
  app.get("/api/campaigns/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getPostsByCampaignId(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaign posts" });
    }
  });

  // Create campaign
  app.post("/api/campaigns", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        userId,
        startDate: req.body.startDate,
        endDate: req.body.endDate || new Date(new Date(req.body.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Generate campaign content
  app.post("/api/campaigns/:id/generate", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Update campaign status to generating
      await storage.updateCampaign(campaign.id, { status: "generating" });

      // Generate campaign posts asynchronously
      (async () => {
        try {
          const startDate = new Date(campaign.startDate);
          const posts = await gcloudAI.generateCampaign(
            {
              businessName: campaign.businessName,
              productName: campaign.productName || undefined,
              targetAudience: campaign.targetAudience,
              brandTone: campaign.brandTone,
              keyMessages: campaign.keyMessages || [],
              callToAction: campaign.callToAction,
              platform: campaign.platform,
              visualStyle: campaign.visualStyle,
              colorScheme: campaign.colorScheme || undefined,
            },
            startDate
          );

          // Generate images for posts
          await gcloudAI.generateCampaignImages(posts);

          // Create posts in storage
          for (const post of posts) {
            await storage.createPost({
              userId: campaign.userId,
              campaignId: campaign.id,
              content: post.content,
              imageUrl: post.imageUrl,
              imagePrompt: post.imagePrompt,
              platforms: [campaign.platform],
              status: "pending",
              scheduledFor: post.scheduledFor,
              aiGenerated: true,
            });
          }

          // Update campaign status to review
          await storage.updateCampaign(campaign.id, { 
            status: "review",
            generationProgress: 100,
          });
        } catch (error) {
          console.error("Failed to generate campaign:", error);
          await storage.updateCampaign(campaign.id, { 
            status: "draft",
            generationProgress: 0,
          });
        }
      })();

      res.json({ message: "Campaign generation started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate campaign" });
    }
  });

  // Create new post
  app.post("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user-1";
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate credit cost
      let creditCost = 1; // Base cost for text post
      if (req.body.aiGenerated) {
        creditCost += 4; // Additional cost for AI generation
      }
      if (req.body.imageUrl && req.body.imagePrompt) {
        creditCost += 45; // Cost for image generation (50 - 5 already counted)
      }
      if (req.body.videoUrl && req.body.videoPrompt) {
        creditCost += 495; // Cost for video generation (500 - 5 already counted)
      }

      // Check if user has enough credits
      if (user.credits < creditCost) {
        return res.status(402).json({ 
          message: "Insufficient credits", 
          required: creditCost, 
          available: user.credits 
        });
      }

      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Update post
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const post = await storage.updatePost(id, updates);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePost(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Generate AI content suggestions
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Mock AI suggestions based on prompt
      const suggestions = generateAISuggestions(prompt);
      
      const aiSuggestion = await storage.createAiSuggestion({
        userId: "demo-user-1",
        prompt,
        suggestions,
        selected: false,
      });

      res.json(aiSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });

  // Generate AI content with enhanced parameters (supports text, image, and video via Vertex AI)
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const {
        businessName,
        productName,
        targetAudience,
        brandTone,
        keyMessages,
        callToAction,
        platform,
        isAdvertisement,
        additionalContext,
        mediaType,
        generateImage,
        generateVideo,
        visualStyle,
        colorScheme,
        imagePrompt: userImagePrompt,
        videoPrompt,
        videoDuration,
        videoTextOverlay,
      } = req.body;

      // Import AI generation functions from Google Cloud AI
      const { generateTextContent, generateImage: generateAIImage, generateVideo: generateAIVideo } = await import('./gcloud-ai.js');
      
      // Always generate text content
      const content = await generateTextContent({
        businessName,
        productName,
        targetAudience,
        brandTone,
        keyMessages: keyMessages || [],
        callToAction,
        platform,
        isAdvertisement,
        additionalContext,
      });

      let imageUrl = null;
      let videoUrl = null;
      let generatedImagePrompt = null;

      // Generate media based on mediaType
      if (mediaType === "image" || generateImage) {
        // Generate image using Imagen4
        const imageDescriptionPrompt = userImagePrompt || 
          `Create a ${visualStyle || 'modern'} image for ${businessName} ${productName ? `featuring ${productName}` : ''}. 
           Target audience: ${targetAudience || 'general audience'}. 
           ${isAdvertisement ? 'Advertisement style' : 'Organic social media style'}. 
           ${additionalContext || ''}`;
        
        generatedImagePrompt = imageDescriptionPrompt;
        
        imageUrl = await generateAIImage({
          prompt: imageDescriptionPrompt,
          visualStyle: visualStyle || 'modern',
          colorScheme,
          businessContext: `${businessName} - ${productName || 'business'}`,
          aspectRatio: platform === 'Instagram' ? '1:1' : '16:9',
        });
      } else if (mediaType === "video" || generateVideo) {
        // Generate video using Veo3 Fast
        const videoDescriptionPrompt = videoPrompt || userImagePrompt || 
          `Create a ${videoDuration || 15}-second ${visualStyle || 'modern'} video for ${businessName} ${productName ? `showcasing ${productName}` : ''}. 
           Target audience: ${targetAudience || 'general audience'}. 
           ${isAdvertisement ? 'Advertisement format' : 'Organic social media format'}. 
           ${videoTextOverlay ? `Include text overlay: ${videoTextOverlay}` : ''}
           ${additionalContext || ''}`;
        
        videoUrl = await generateAIVideo({
          prompt: videoDescriptionPrompt,
          duration: videoDuration || 15,
          visualStyle: visualStyle || 'modern',
          includeText: videoTextOverlay,
          businessContext: `${businessName} - ${productName || 'business'}`,
        });
      }
      
      res.json({ 
        content, 
        imageUrl, 
        videoUrl,
        imagePrompt: generatedImagePrompt,
        mediaType: mediaType || 'text',
      });
    } catch (error) {
      console.error('AI generation error:', error);
      res.status(500).json({ message: "Failed to generate AI content", error: error.message });
    }
  });

  // Get dashboard analytics
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      // Return mock analytics data for dashboard
      const dashboardData = {
        totalPosts: 47,
        totalEngagement: 2800,
        pendingApproval: 3,
        scheduledPosts: 12,
        metrics: {
          totalReach: 15200,
          engagement: 2800,
          newFollowers: 1200,
          clickRate: 4.2,
        },
        platformPerformance: [
          { platform: "Instagram", followers: 2100, engagement: 1234, change: 15 },
          { platform: "Facebook", followers: 1800, engagement: 892, change: 8 },
          { platform: "X (Twitter)", followers: 956, engagement: 445, change: -3 },
          { platform: "LinkedIn", followers: 534, engagement: 227, change: 22 },
        ],
        engagementOverTime: [
          { date: "Jan 1", value: 60 },
          { date: "Jan 5", value: 80 },
          { date: "Jan 10", value: 45 },
          { date: "Jan 15", value: 95 },
          { date: "Jan 20", value: 70 },
          { date: "Jan 25", value: 110 },
          { date: "Today", value: 85 },
        ],
        topPerformingPosts: [
          {
            id: "1",
            platform: "Instagram",
            content: "Morning coffee specials are here! ☕",
            publishedAt: "3 days ago",
            engagement: { likes: 324, comments: 45, shares: 12 },
            engagementRate: 94,
          },
          {
            id: "2",
            platform: "Facebook",
            content: "Behind the scenes: How we roast our beans",
            publishedAt: "1 week ago",
            engagement: { likes: 198, comments: 23, shares: 8 },
            engagementRate: 87,
          },
        ],
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock AI suggestion generator
function generateAISuggestions(prompt: string): string[] {
  const suggestions = [
    "☕ Start your Monday with our signature blend! What's your go-to morning coffee order? #MondayMotivation #CoffeeLovers",
    "Fresh pastries, warm atmosphere, and the perfect cup of coffee - that's what makes mornings special at our café ✨",
    "Behind the scenes: Our baristas craft each latte with love and precision. Come taste the difference! ☕❤️",
    "🥐 Tuesday treats are here! Enjoy our freshly baked croissants with your favorite coffee blend. #TuesdayTreats #FreshBaked",
    "What's your perfect coffee pairing? Tell us in the comments! ☕🥧 #CoffeePairing #CustomerChoice",
    "Weekend vibes at the café! ☕ Join us for a relaxing coffee break and catch up with friends. #WeekendVibes #CafeLife",
  ];

  // Return 3 random suggestions
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}
