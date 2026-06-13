import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import ClimateChart from '@/components/shared/ClimateChart';
import { climateTypes, exampleClimateData } from '@/data/climateData';

interface QuizQuestion {
  type: 'climate';
  temps: number[];
  precips: number[];
  answer: string;
  steps: string[];
}

function generateQuiz(): QuizQuestion {
  const keys = Object.keys(exampleClimateData);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const ex = exampleClimateData[randomKey as keyof typeof exampleClimateData];
  const climate = climateTypes.find((c) => c.id === randomKey)!;

  return {
    type: 'climate',
    temps: [...ex.temps],
    precips: [...ex.precips],
    answer: climate.name,
    steps: climate.judgeRules,
  };
}

const ChartReading: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [quiz, setQuiz] = useState<QuizQuestion>(generateQuiz);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    setQuiz(generateQuiz());
    setCurrentStep(0);
    setShowAnswer(false);
  };

  const avgTemp = quiz.temps.reduce((a, b) => a + b, 0) / 12;
  const maxTemp = Math.max(...quiz.temps);
  const minTemp = Math.min(...quiz.temps);
  const annualPrecip = quiz.precips.reduce((a, b) => a + b, 0);

  return (
    <ToolPageLayout title="图表判读训练" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            请判读以下气候统计图
          </Typography>
          <ClimateChart monthlyTemps={quiz.temps} monthlyPrecips={quiz.precips} height={280} />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>数据摘要</Typography>
            <Typography variant="body2">年均温：{avgTemp.toFixed(1)}°C</Typography>
            <Typography variant="body2">最热月：{maxTemp}°C / 最冷月：{minTemp}°C</Typography>
            <Typography variant="body2">年降水量：{annualPrecip}mm</Typography>
            <Typography variant="body2">气温年较差：{(maxTemp - minTemp).toFixed(1)}°C</Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>判读步骤引导</Typography>

          {[1, 2, 3].map((step) => (
            <Card key={step} variant="outlined" sx={{
              mb: 1,
              opacity: currentStep >= step - 1 ? 1 : 0.4,
              transition: 'opacity 0.3s',
            }}>
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Step {step}: {step === 1 ? '以气温定带' : step === 2 ? '以降水定型' : '综合判断'}
                </Typography>
                {currentStep >= step - 1 && step <= quiz.steps.length && (
                  <Typography variant="body2" sx={{ color: '#2E7D32', mt: 0.5 }}>
                    {quiz.steps[step - 1]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentStep((s) => Math.min(s + 1, 3))}
              disabled={currentStep >= 3}
            >
              下一步
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowAnswer(true)}
              sx={{ bgcolor: '#2E7D32' }}
            >
              显示答案
            </Button>
            <Button variant="outlined" onClick={handleNext}>
              下一题
            </Button>
          </Box>

          {showAnswer && (
            <Card sx={{ mt: 2, bgcolor: '#e8f5e9', border: '2px solid #2E7D32' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                  答案：{quiz.answer}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {quiz.steps.map((s, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.3 }}>
                      {s}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default ChartReading;
