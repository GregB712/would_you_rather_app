import { PrismaClient, QuestionMode } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  {
    optionA: "Always know when someone is lying",
    optionB: "Always get away with lying",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Have unlimited pizza for life",
    optionB: "Have unlimited ice cream for life",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Give up coffee forever",
    optionB: "Give up desserts forever",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Have a personal chef",
    optionB: "Have a personal driver",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Only be able to whisper",
    optionB: "Only be able to shout",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Live near the ocean",
    optionB: "Live in the mountains",
    mode: QuestionMode.FAMILY
  },
  {
    optionA: "Know the exact date of your death",
    optionB: "Know the exact cause of your death",
    mode: QuestionMode.DEEP_DIVE
  },
  {
    optionA: "Be remembered for one great act",
    optionB: "Be quietly loved by everyone close to you",
    mode: QuestionMode.DEEP_DIVE
  },
  {
    optionA: "Relive your happiest memory once",
    optionB: "Erase your most painful memory forever",
    mode: QuestionMode.DEEP_DIVE
  },
  {
    optionA: "Always tell the complete truth",
    optionB: "Always understand why people hide it",
    mode: QuestionMode.DEEP_DIVE
  },
  {
    optionA: "Have a life full of adventure but little stability",
    optionB: "Have a peaceful life with few surprises",
    mode: QuestionMode.DEEP_DIVE
  },
  {
    optionA: "Always know when someone is lying",
    optionB: "Never be able to lie yourself",
    mode: null
  },
  {
    optionA: "Live in a treehouse",
    optionB: "Live on a houseboat",
    mode: null
  },
  {
    optionA: "Find a hidden room in your home",
    optionB: "Find a secret garden nearby",
    mode: null
  },
  {
    optionA: "Wake up with perfect rhythm",
    optionB: "Wake up with perfect balance",
    mode: null
  },
  {
    optionA: "Always choose the fastest line",
    optionB: "Always find the best seat",
    mode: null
  }
];

async function main() {
  for (const question of questions) {
    const existing = await prisma.question.findFirst({
      where: {
        OR: [
          {
            optionA: question.optionA,
            optionB: question.optionB
          },
          {
            optionA: question.optionB,
            optionB: question.optionA
          }
        ]
      }
    });

    if (!existing) {
      await prisma.question.create({
        data: question
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
