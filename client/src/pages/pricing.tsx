import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Building2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: string;
  yearlyPrice: string;
  creditsPerMonth: number;
  features: string[];
  maxPlatforms: number;
  analyticsAccess: boolean;
  aiSuggestions: boolean;
  prioritySupport: boolean;
  teamMembers: number;
  videoGeneration: boolean;
  popular?: boolean;
}

// Credit cost breakdown
const CREDIT_COSTS = {
  textPost: 1,
  aiTextGeneration: 5,
  imageGeneration: 50,
  videoGeneration: 500,
};

export default function Pricing() {
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest(`/api/subscribe/${planId}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "Your subscription has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="w-5 h-5" />;
      case "starter":
        return <Sparkles className="w-5 h-5" />;
      case "professional":
        return <Zap className="w-5 h-5" />;
      case "enterprise":
        return <Crown className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(0);
  };

  // Add popular flag to professional plan
  const enhancedPlans = plans.map(plan => ({
    ...plan,
    popular: plan.id === "professional",
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Scale your social media presence with AI-powered content generation and management
        </p>
        
        {/* Credit Calculator */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-3xl mx-auto">
          <h3 className="font-semibold mb-3">Credit Usage Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-2xl">{CREDIT_COSTS.textPost}</div>
              <div className="text-muted-foreground">Text Post</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{CREDIT_COSTS.aiTextGeneration}</div>
              <div className="text-muted-foreground">AI Text</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{CREDIT_COSTS.imageGeneration}</div>
              <div className="text-muted-foreground">Image</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">{CREDIT_COSTS.videoGeneration}</div>
              <div className="text-muted-foreground">Video (8s)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {enhancedPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "relative flex flex-col",
              plan.popular && "border-primary shadow-lg scale-105"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {getPlanIcon(plan.id)}
                <CardTitle>{plan.displayName}</CardTitle>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${formatPrice(plan.monthlyPrice)}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  or ${formatPrice(plan.yearlyPrice)}/year (save {Math.round((1 - (parseFloat(plan.yearlyPrice) / (parseFloat(plan.monthlyPrice) * 12))) * 100)}%)
                </div>
              </div>
              <CardDescription className="mt-3">
                <span className="font-semibold text-lg">{plan.creditsPerMonth.toLocaleString()}</span> credits/month
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Usage Examples */}
              <div className="mt-6 p-3 bg-muted/50 rounded text-xs">
                <div className="font-semibold mb-1">Monthly capacity:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>• {Math.floor(plan.creditsPerMonth / CREDIT_COSTS.textPost)} text posts</div>
                  <div>• {Math.floor(plan.creditsPerMonth / CREDIT_COSTS.aiTextGeneration)} AI generations</div>
                  {plan.creditsPerMonth >= CREDIT_COSTS.imageGeneration && (
                    <div>• {Math.floor(plan.creditsPerMonth / CREDIT_COSTS.imageGeneration)} images</div>
                  )}
                  {plan.videoGeneration && (
                    <div>• {Math.floor(plan.creditsPerMonth / CREDIT_COSTS.videoGeneration)} videos</div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => subscribeMutation.mutate(plan.id)}
                disabled={subscribeMutation.isPending || user?.subscriptionId === plan.id}
              >
                {user?.subscriptionId === plan.id ? "Current Plan" : 
                 plan.id === "free" ? "Start Free Trial" : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">What are credits?</h3>
              <p className="text-sm text-muted-foreground">
                Credits are used for content generation and platform features. Different actions consume different amounts of credits based on computational cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Do unused credits roll over?</h3>
              <p className="text-sm text-muted-foreground">
                No, credits reset each month. We recommend choosing a plan that matches your typical monthly usage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and PayPal through our secure payment processor.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Start with our Free plan which includes 50 credits per month to test our features before upgrading.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise CTA */}
      <div className="mt-12 text-center p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
        <h2 className="text-2xl font-bold mb-3">Need a Custom Solution?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get custom credit packages, dedicated support, and enterprise features tailored to your business needs.
        </p>
        <Button size="lg" variant="outline">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}