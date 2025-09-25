import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/hooks/use-game-state";
import { ACHIEVEMENTS, XP_PER_LEVEL, RARITY_COLORS } from "@/lib/constants";
import { Trophy, Target, Zap, TrendingUp } from "lucide-react";

export default function Statistics() {
  const { gameState, inventory, achievements, dailyChallenges } = useGameState();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProfit = gameState.totalEarned - gameState.totalSpent;
    const profitPercentage = gameState.totalSpent > 0 ? (totalProfit / gameState.totalSpent) * 100 : 0;
    
    // Rarity distribution
    const rarityDistribution = inventory.reduce((acc, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rarityChartData = Object.entries(rarityDistribution).map(([rarity, count]) => ({
      name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
      value: count,
      color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
    }));

    // Value distribution by item type
    const typeDistribution = inventory.reduce((acc, item) => {
      acc[item.itemType] = (acc[item.itemType] || 0) + item.currentValue;
      return acc;
    }, {} as Record<string, number>);

    const typeChartData = Object.entries(typeDistribution).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.round(value * 100) / 100,
    }));

    // Mock historical data for demonstration (in real app would come from stored history)
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      profit: Math.random() * 200 - 100,
      casesOpened: Math.floor(Math.random() * 10),
    }));

    return {
      totalProfit,
      profitPercentage,
      rarityChartData,
      typeChartData,
      historicalData,
    };
  }, [gameState, inventory]);

  const xpProgress = (gameState.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
  const nextLevelXp = XP_PER_LEVEL - (gameState.xp % XP_PER_LEVEL);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Cases</p>
                  <p className="text-2xl font-bold" data-testid="total-cases">
                    {gameState.casesOpened}
                  </p>
                </div>
                <div className="text-primary text-xl">📦</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="total-spent">
                    ${gameState.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="text-destructive text-xl">💸</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-primary" data-testid="total-earned">
                    ${gameState.totalEarned.toFixed(2)}
                  </p>
                </div>
                <div className="text-primary text-xl">💰</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Net Profit</p>
                  <p 
                    className={`text-2xl font-bold ${
                      stats.totalProfit >= 0 ? 'text-primary' : 'text-destructive'
                    }`}
                    data-testid="net-profit"
                  >
                    ${stats.totalProfit.toFixed(2)}
                  </p>
                </div>
                <div className={`text-xl ${stats.totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {stats.totalProfit >= 0 ? '📈' : '📉'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Progression */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Player Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {gameState.level}
                      </span>
                    </div>
                    <span className="font-medium" data-testid="current-level">
                      Level {gameState.level}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground" data-testid="xp-display">
                    {gameState.xp} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-2" data-testid="xp-progress-bar" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Level {gameState.level}</span>
                  <span>{nextLevelXp} XP to next level</span>
                  <span>Level {gameState.level + 1}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rarity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Item Rarity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="rarity-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.rarityChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.rarityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Value by Item Type */}
          <Card>
            <CardHeader>
              <CardTitle>Value by Item Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" data-testid="value-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profit/Loss Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="historical-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Profit/Loss']} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const userAchievement = achievements.find(a => a.id === achievement.id);
                  const isUnlocked = userAchievement?.unlocked || false;
                  const progress = userAchievement?.progress || 0;
                  
                  return (
                    <div 
                      key={achievement.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        isUnlocked ? 'bg-primary/20' : 'bg-secondary/20'
                      }`}
                      data-testid={`achievement-${achievement.id}`}
                    >
                      <div className={`text-2xl ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isUnlocked ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isUnlocked ? 'text-primary' : ''}`}>
                          {achievement.name}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {achievement.description}
                        </div>
                        {!isUnlocked && (
                          <Progress 
                            value={(progress / achievement.requirement) * 100} 
                            className="h-1"
                          />
                        )}
                      </div>
                      <Badge variant={isUnlocked ? "default" : "secondary"}>
                        {isUnlocked ? "Unlocked" : `${progress}/${achievement.requirement}`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyChallenges.map((challenge) => (
                  <div 
                    key={challenge.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      challenge.completed ? 'bg-primary/20' : 'bg-secondary/20'
                    }`}
                    data-testid={`challenge-${challenge.id}`}
                  >
                    <div className={`text-2xl ${challenge.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                      {challenge.completed ? <Trophy className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${challenge.completed ? 'text-primary' : ''}`}>
                        {challenge.name}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {challenge.description}
                      </div>
                      {!challenge.completed && (
                        <Progress 
                          value={(challenge.progress / challenge.requirement) * 100} 
                          className="h-1"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={challenge.completed ? "default" : "secondary"}>
                        {challenge.completed ? "Complete" : `${challenge.progress}/${challenge.requirement}`}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        +{challenge.reward} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
