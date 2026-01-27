import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/_ui/components/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/app/_ui/components/accordion'
import { FileText, AlertTriangle, ShieldCheck, CheckCircle, ThumbsUp, Info } from 'lucide-react'

// Define the interface directly in this file
export interface ContractAnalysisResponse {
  analysis_id: string;
  conversation_id: string;
  message_id: string;
  filename: string;
  summary: string;
  positive_clauses: string[];
  risks: Array<{
    level: 'High' | 'Medium' | 'Low';
    description: string;
    suggestion: string;
  }>;
  disclaimer: string;
  full_text: string;
}

interface ContractAnalysisResultProps {
  result: ContractAnalysisResponse
}

export function ContractAnalysisResult({ result }: ContractAnalysisResultProps) {
  const getRiskBadgeVariant = (level: 'High' | 'Medium' | 'Low'): 'destructive' | 'secondary' | 'default' => {
    switch (level) {
      case 'High': return 'destructive'
      case 'Medium': return 'secondary'
      case 'Low': return 'default'
    }
  }

  const getRiskIcon = (level: 'High' | 'Medium' | 'Low') => {
    switch (level) {
      case 'High': return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'Medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'Low': return <ShieldCheck className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <Card className="w-full max-w-2xl border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-lg font-bold text-primary">تحلیل قرارداد</CardTitle>
            <p className="text-sm text-muted-foreground">{result.filename}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">خلاصه تحلیل</h3>
            <p className="text-sm text-foreground/80">{result.summary}</p>
          </div>

          <Accordion type="multiple" className="w-full" defaultValue={['risks']}>
            {result.positive_clauses && result.positive_clauses.length > 0 && (
              <AccordionItem value="positives">
                <AccordionTrigger className="text-base font-semibold">
                  نکات مثبت شناسایی‌شده ({result.positive_clauses.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {result.positive_clauses.map((clause, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                        <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">{clause}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="risks">
              <AccordionTrigger className="text-base font-semibold">
                ریسک‌های شناسایی‌شده ({result.risks.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {result.risks.map((risk, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getRiskIcon(risk.level)}
                          <span className="font-semibold">سطح ریسک</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/90 mb-2">
                        <span className="font-semibold">شرح: </span>{risk.description}
                      </p>
                      <div className="p-2 rounded-md bg-green-50 border border-green-200">
                        <p className="text-sm text-green-800 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span><span className="font-semibold">پیشنهاد: </span>{risk.suggestion}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="bg-background/50 p-3 mt-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
        </div>
      </CardFooter>
    </Card>
  )
}