import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  businessName: text("business_name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platforms = pgTable("platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isConnected: boolean("is_connected").default(false),
  userId: varchar("user_id").references(() => users.id),
  accountId: text("account_id"),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  platforms: json("platforms").$type<string[]>().notNull(),
  status: text("status").notNull(), // draft, pending, approved, rejected, published, scheduled
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  mediaUrls: json("media_urls").$type<string[]>().default([]),
  aiGenerated: boolean("ai_generated").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  engagementData: json("engagement_data").$type<{
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    reach: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  suggestions: json("suggestions").$type<string[]>().notNull(),
  selected: boolean("selected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  metric: text("metric").notNull(), // engagement, reach, followers, clicks
  value: integer("value").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  businessName: true,
  avatar: true,
});

export const insertPlatformSchema = createInsertSchema(platforms).pick({
  name: true,
  icon: true,
  color: true,
  isConnected: true,
  userId: true,
  accountId: true,
  accessToken: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  platforms: true,
  status: true,
  scheduledFor: true,
  mediaUrls: true,
  aiGenerated: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  userId: true,
  prompt: true,
  suggestions: true,
  selected: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  platform: true,
  metric: true,
  value: true,
  date: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
