import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Header } from "@/components/layout/Header"

export default function Home() {
  return (
    <div className="bg-white">
      <Header 
        title="RepTracking" 
        subtitle="Track your fitness journey"
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary-600">12</div>
              <div className="text-sm text-gray-600">Workouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary-600">3.2k</div>
              <div className="text-sm text-gray-600">Total Reps</div>
            </CardContent>
          </Card>
        </div>

        {/* Start Workout Button */}
        <div className="space-y-4">
          <Button className="w-full h-14 text-lg font-semibold">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start Workout
          </Button>
          
          <Button variant="outline" className="w-full h-12">
            Quick Session
          </Button>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Push Day A</div>
                  <div className="text-sm text-gray-600">2 days ago • 45 min</div>
                </div>
                <div className="text-sm text-primary-600 font-medium">12 sets</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Pull Day B</div>
                  <div className="text-sm text-gray-600">4 days ago • 52 min</div>
                </div>
                <div className="text-sm text-primary-600 font-medium">15 sets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-primary-900 mb-2">Welcome to RepTracking!</h3>
            <p className="text-sm text-primary-800">
              Your mobile-first gym companion. Track workouts, monitor progress, and achieve your fitness goals with ease.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
