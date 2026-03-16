'use client'

import { Settings, X } from 'lucide-react'
import { type RoomSettings } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RoomSettingsProps {
  settings: RoomSettings
  onChange: (settings: RoomSettings) => void
}

const ACTIVITY_LABELS: Record<number, string> = {
  0: 'Only when asked',
  25: 'Quiet',
  50: 'Balanced',
  75: 'Active',
  100: 'Proactive',
}

function getActivityLabel(value: number): string {
  const keys = Object.keys(ACTIVITY_LABELS).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  for (const k of keys) {
    if (Math.abs(k - value) < Math.abs(closest - value)) closest = k
  }
  return ACTIVITY_LABELS[closest]
}

export function RoomSettingsPanel({ settings, onChange }: RoomSettingsProps) {
  const update = <K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  const toggleCapability = (key: keyof RoomSettings['capabilities']) => {
    onChange({
      ...settings,
      capabilities: {
        ...settings.capabilities,
        [key]: !settings.capabilities[key],
      },
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent
            hover:border-border transition-all"
          aria-label="Room settings"
        >
          <Settings size={15} />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[360px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <SheetTitle className="text-[14px] font-semibold">AI Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* AI Name */}
          <div>
            <label className="text-[12px] font-semibold text-foreground mb-2 block">
              AI Name
            </label>
            <input
              type="text"
              value={settings.aiName}
              onChange={e => update('aiName', e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]
                text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              placeholder="Mesh"
            />
          </div>

          {/* Personality */}
          <div>
            <label className="text-[12px] font-semibold text-foreground mb-2 block">
              Personality
            </label>
            <Select
              value={settings.personality}
              onValueChange={v => update('personality', v as RoomSettings['personality'])}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {settings.personality === 'professional' && 'Clear, direct, and helpful. No fluff.'}
              {settings.personality === 'casual' && 'Friendly and conversational. Warm but concise.'}
              {settings.personality === 'minimal' && 'Extremely concise. One-sentence answers.'}
            </p>
          </div>

          {/* Activity Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-foreground">
                Activity Level
              </label>
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {getActivityLabel(settings.activityLevel)}
              </span>
            </div>
            <Slider
              value={[settings.activityLevel]}
              onValueChange={([v]) => update('activityLevel', v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">Only when asked</span>
              <span className="text-[10px] text-muted-foreground">Proactive</span>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <label className="text-[12px] font-semibold text-foreground mb-3 block">
              Capabilities
            </label>
            <div className="space-y-3">
              {([
                ['extractDecisions', 'Extract decisions & tasks'] as const,
                ['summarize', 'Summarize conversations'] as const,
                ['answerQuestions', 'Answer questions'] as const,
                ['suggestActions', 'Suggest actions'] as const,
              ]).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[12.5px] text-foreground">{label}</span>
                  <Switch
                    checked={settings.capabilities[key]}
                    onCheckedChange={() => toggleCapability(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Room Rules */}
          <div>
            <label className="text-[12px] font-semibold text-foreground mb-2 block">
              Room Rules
            </label>
            <textarea
              value={settings.roomRules}
              onChange={e => update('roomRules', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px]
                text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20
                transition-all resize-none"
              placeholder={"Natural language rules. One per line.\ne.g., Always include unit economics when discussing pricing"}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              The AI will follow these rules in every response.
            </p>
          </div>

          {/* Learned Preferences */}
          <div>
            <label className="text-[12px] font-semibold text-foreground mb-2 block">
              Learned Preferences
            </label>
            {settings.learnedPreferences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.learnedPreferences.map((pref, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[11.5px] bg-muted text-foreground
                      px-2.5 py-1 rounded-full border border-border"
                  >
                    <span className="max-w-[200px] truncate">{pref}</span>
                    <button
                      onClick={() => {
                        onChange({
                          ...settings,
                          learnedPreferences: settings.learnedPreferences.filter((_, idx) => idx !== i),
                        })
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Remove preference"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] text-muted-foreground/70 italic">
                No feedback yet. Use thumbs up/down on AI messages.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            Settings apply to this room only.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
