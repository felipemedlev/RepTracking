import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const exercises = [
  // Push Exercises (Chest, Shoulders, Triceps)
  { name: 'Bench Press', category: 'push' },
  { name: 'Incline Bench Press', category: 'push' },
  { name: 'Decline Bench Press', category: 'push' },
  { name: 'Dumbbell Bench Press', category: 'push' },
  { name: 'Dumbbell Incline Press', category: 'push' },
  { name: 'Dumbbell Flyes', category: 'push' },
  { name: 'Incline Dumbbell Flyes', category: 'push' },
  { name: 'Push-ups', category: 'push' },
  { name: 'Incline Push-ups', category: 'push' },
  { name: 'Decline Push-ups', category: 'push' },
  { name: 'Dips', category: 'push' },
  { name: 'Chest Dips', category: 'push' },
  { name: 'Cable Chest Flyes', category: 'push' },
  { name: 'Pec Deck Machine', category: 'push' },
  
  // Shoulders
  { name: 'Overhead Press', category: 'push' },
  { name: 'Military Press', category: 'push' },
  { name: 'Dumbbell Shoulder Press', category: 'push' },
  { name: 'Arnold Press', category: 'push' },
  { name: 'Lateral Raises', category: 'push' },
  { name: 'Front Raises', category: 'push' },
  { name: 'Rear Delt Flyes', category: 'push' },
  { name: 'Cable Lateral Raises', category: 'push' },
  { name: 'Pike Push-ups', category: 'push' },
  { name: 'Handstand Push-ups', category: 'push' },
  
  // Triceps
  { name: 'Tricep Dips', category: 'push' },
  { name: 'Close-Grip Bench Press', category: 'push' },
  { name: 'Tricep Pushdowns', category: 'push' },
  { name: 'Overhead Tricep Extension', category: 'push' },
  { name: 'Skull Crushers', category: 'push' },
  { name: 'Diamond Push-ups', category: 'push' },
  { name: 'Tricep Kickbacks', category: 'push' },

  // Pull Exercises (Back, Biceps)
  { name: 'Pull-ups', category: 'pull' },
  { name: 'Chin-ups', category: 'pull' },
  { name: 'Wide-Grip Pull-ups', category: 'pull' },
  { name: 'Lat Pulldowns', category: 'pull' },
  { name: 'Wide-Grip Lat Pulldowns', category: 'pull' },
  { name: 'Seated Cable Rows', category: 'pull' },
  { name: 'Bent-Over Rows', category: 'pull' },
  { name: 'Barbell Rows', category: 'pull' },
  { name: 'Dumbbell Rows', category: 'pull' },
  { name: 'Single-Arm Dumbbell Row', category: 'pull' },
  { name: 'T-Bar Rows', category: 'pull' },
  { name: 'Inverted Rows', category: 'pull' },
  { name: 'Face Pulls', category: 'pull' },
  { name: 'Reverse Flyes', category: 'pull' },
  { name: 'Shrugs', category: 'pull' },
  { name: 'Deadlifts', category: 'pull' },
  { name: 'Romanian Deadlifts', category: 'pull' },
  { name: 'Sumo Deadlifts', category: 'pull' },
  
  // Biceps
  { name: 'Bicep Curls', category: 'pull' },
  { name: 'Dumbbell Bicep Curls', category: 'pull' },
  { name: 'Barbell Curls', category: 'pull' },
  { name: 'Hammer Curls', category: 'pull' },
  { name: 'Concentration Curls', category: 'pull' },
  { name: 'Cable Curls', category: 'pull' },
  { name: 'Preacher Curls', category: 'pull' },
  { name: '21s Bicep Curls', category: 'pull' },

  // Legs (Quads, Hamstrings, Glutes, Calves)
  { name: 'Squats', category: 'legs' },
  { name: 'Back Squats', category: 'legs' },
  { name: 'Front Squats', category: 'legs' },
  { name: 'Goblet Squats', category: 'legs' },
  { name: 'Bulgarian Split Squats', category: 'legs' },
  { name: 'Lunges', category: 'legs' },
  { name: 'Walking Lunges', category: 'legs' },
  { name: 'Reverse Lunges', category: 'legs' },
  { name: 'Side Lunges', category: 'legs' },
  { name: 'Step-ups', category: 'legs' },
  { name: 'Leg Press', category: 'legs' },
  { name: 'Hack Squats', category: 'legs' },
  { name: 'Wall Sits', category: 'legs' },
  { name: 'Jump Squats', category: 'legs' },
  
  // Hamstrings & Glutes
  { name: 'Romanian Deadlifts', category: 'legs' },
  { name: 'Stiff-Leg Deadlifts', category: 'legs' },
  { name: 'Leg Curls', category: 'legs' },
  { name: 'Glute Ham Raises', category: 'legs' },
  { name: 'Hip Thrusts', category: 'legs' },
  { name: 'Glute Bridges', category: 'legs' },
  { name: 'Single-Leg Glute Bridges', category: 'legs' },
  { name: 'Good Mornings', category: 'legs' },
  
  // Calves
  { name: 'Calf Raises', category: 'legs' },
  { name: 'Standing Calf Raises', category: 'legs' },
  { name: 'Seated Calf Raises', category: 'legs' },
  { name: 'Single-Leg Calf Raises', category: 'legs' },

  // Core/Abs
  { name: 'Crunches', category: 'core' },
  { name: 'Sit-ups', category: 'core' },
  { name: 'Bicycle Crunches', category: 'core' },
  { name: 'Russian Twists', category: 'core' },
  { name: 'Plank', category: 'core' },
  { name: 'Side Plank', category: 'core' },
  { name: 'Plank Up-Downs', category: 'core' },
  { name: 'Mountain Climbers', category: 'core' },
  { name: 'Leg Raises', category: 'core' },
  { name: 'Hanging Leg Raises', category: 'core' },
  { name: 'Flutter Kicks', category: 'core' },
  { name: 'Scissor Kicks', category: 'core' },
  { name: 'Dead Bug', category: 'core' },
  { name: 'Bird Dog', category: 'core' },
  { name: 'Ab Wheel Rollouts', category: 'core' },
  { name: 'Cable Crunches', category: 'core' },
  { name: 'Wood Choppers', category: 'core' },
  { name: 'V-ups', category: 'core' },
  { name: 'Hollow Body Hold', category: 'core' },
  { name: 'Superman', category: 'core' },
  
  // Full Body/Compound
  { name: 'Burpees', category: 'core' },
  { name: 'Turkish Get-ups', category: 'core' },
  { name: 'Man Makers', category: 'core' },
  { name: 'Thrusters', category: 'push' },
  { name: 'Clean and Press', category: 'push' },
  { name: 'Kettlebell Swings', category: 'legs' },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.workoutExercise.deleteMany({})
  await prisma.set.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.workoutPlan.deleteMany({})
  await prisma.exercise.deleteMany({})
  
  console.log('🗑️  Cleared existing data')

  // Seed exercises
  console.log('🏋️  Seeding exercises...')
  
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: {
        name: exercise.name,
        category: exercise.category,
        isCustom: false,
        userId: null, // Default exercises have no user
      },
    })
  }

  console.log(`✅ Created ${exercises.length} exercises`)
  console.log('🎯 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })