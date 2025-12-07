---
name: create-component
description: ZZIK Linear Deep Space + Orange Point 스타일 React 컴포넌트 생성
arguments:
  - name: name
    description: 컴포넌트 이름 (PascalCase)
    required: true
  - name: type
    description: 컴포넌트 타입 (button, card, input, modal, layout)
    required: false
---

# Create Component Command

## Component: $ARGUMENTS.name
## Type: $ARGUMENTS.type (기본값: card)

ZZIK Linear Deep Space + Orange Point 디자인 시스템에 맞는 React 컴포넌트를 생성합니다.

## Design Tokens
```css
/* Brand Color */
--linear-orange: #ea8c15;
--linear-orange-hover: #f5a623;

/* Backgrounds */
--linear-bg: #08090A;
--linear-bg-subtle: #0C0E10;

/* Glass Effect */
--glass-bg: linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%);
--glass-border: 1px solid rgba(255, 255, 255, 0.06);
```

## 컴포넌트 템플릿

### Button Type
```tsx
'use client';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface ${name}Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const ${name} = forwardRef<HTMLButtonElement, ${name}Props>(
  ({ children, variant = 'primary', size = 'md', disabled, loading, onClick }, ref) => {
    const isPrimary = variant === 'primary';

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, boxShadow: isPrimary ? '0 0 30px rgba(234, 140, 21, 0.3)' : undefined }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        onClick={onClick}
        className="relative overflow-hidden rounded-xl font-semibold disabled:opacity-50"
        style={isPrimary ? {
          background: 'linear-gradient(135deg, #ea8c15 0%, #f5a623 100%)',
          color: 'white',
        } : undefined}
      >
        {loading && <LoadingSpinner />}
        {children}
      </motion.button>
    );
  }
);
```

### Card Type
```tsx
'use client';
import { motion } from 'framer-motion';

interface ${name}Props {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  orangeAccent?: boolean;
}

export function ${name}({ children, className = '', hover = true, orangeAccent = false }: ${name}Props) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={`relative rounded-2xl p-5 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%)',
        backdropFilter: 'blur(40px)',
        border: orangeAccent ? '1px solid rgba(234, 140, 21, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}
      />
      {children}
    </motion.div>
  );
}
```

### Input Type
```tsx
'use client';
import { useState, forwardRef } from 'react';

interface ${name}Props {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
}

export const ${name} = forwardRef<HTMLInputElement, ${name}Props>(
  ({ type = 'text', placeholder, value, onChange, error, label }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="space-y-2">
        {label && <label className="text-sm text-white/60">{label}</label>}
        <div className={`relative rounded-xl transition-all duration-300 ${
          focused ? 'ring-2 ring-[#ea8c15]/50' : ''
        } ${error ? 'ring-2 ring-red-500/50' : ''}`}>
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
```

### Modal Type
```tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface ${name}Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ${name}({ open, onClose, title, children }: ${name}Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 m-auto max-w-md max-h-fit rounded-2xl p-6 z-50"
            style={{
              background: 'linear-gradient(135deg, rgba(18, 19, 20, 0.95) 0%, rgba(8, 9, 10, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {title && (
              <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## 파일 위치
```
src/components/linear/${name.toLowerCase()}.tsx
```

## 체크리스트
- [ ] TypeScript 인터페이스 정의
- [ ] Framer Motion 애니메이션 적용
- [ ] Orange Point (#ea8c15) 컬러 사용
- [ ] Glass 효과 적용 (카드류)
- [ ] 반응형 스타일링
- [ ] 접근성 고려 (aria-* 속성)
- [ ] forwardRef 적용 (필요시)
- [ ] 'use client' 지시문 (클라이언트 컴포넌트)
