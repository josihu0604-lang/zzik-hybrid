'use client';

import Link from 'next/link';
import { ZzikLogo } from '@/components/cosmic';

/**
 * ZZIK 서비스 이용약관
 * App Store & Google Play 심사 필수 항목
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-space-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-white/5 bg-space-950/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <ZzikLogo size={28} />
            <span className="text-white/60 text-sm font-medium">ZZIK</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">서비스 이용약관</h1>
        <p className="text-white/40 text-sm mb-10">최종 수정일: 2024년 12월 4일</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제1조 (목적)</h2>
            <p>
              본 약관은 ZZIK(이하 &quot;회사&quot;)이 제공하는 위치 기반 체크인 서비스 및 관련
              서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및
              책임 사항 등 기본적인 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="text-white">&quot;서비스&quot;</span>란 ZZIK이 제공하는 Triple
                Verification(GPS + QR + 영수증) 기반 체크인 서비스를 말합니다.
              </li>
              <li>
                <span className="text-white">&quot;회원&quot;</span>이란 본 약관에 동의하고 회사와
                서비스 이용계약을 체결한 자를 말합니다.
              </li>
              <li>
                <span className="text-white">&quot;체크인&quot;</span>이란 회원이 특정 장소에서
                Triple Verification을 통해 방문을 인증하는 행위를 말합니다.
              </li>
              <li>
                <span className="text-white">&quot;로열티 인덱스&quot;</span>란 회원의 매장 방문
                패턴을 기반으로 산출되는 지표를 말합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</li>
              <li>
                회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을
                변경할 수 있습니다.
              </li>
              <li>
                변경된 약관은 서비스 내 공지 또는 이메일 통지 후 7일이 경과한 때부터 효력이
                발생합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제4조 (서비스의 내용)</h2>
            <p className="mb-4">회사가 제공하는 서비스는 다음과 같습니다:</p>
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Triple Verification 체크인</h3>
                <p>GPS(40%) + QR 코드(40%) + 영수증(20%) 3중 검증 시스템</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">여행 기록 관리</h3>
                <p>방문한 장소, 사진, 후기 등의 여행 기록 저장 및 관리</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">네이버 클립 연동</h3>
                <p>인증된 방문 기록을 네이버 클립에 공유하는 기능</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">로열티 프로그램</h3>
                <p>체크인 기반 로열티 인덱스 및 혜택 제공</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제5조 (회원 가입)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                회원 가입은 이용자가 본 약관에 동의하고 회사가 정한 양식에 따라 회원 정보를 기입하여
                회원 가입을 신청합니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 거부하거나 유보할 수 있습니다:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>타인의 정보를 도용한 경우</li>
                  <li>허위 정보를 기재한 경우</li>
                  <li>기타 회사가 정한 이용 신청 요건이 미비된 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제6조 (회원의 의무)</h2>
            <p className="mb-4">회원은 다음 각 호의 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>허위 체크인 또는 위치 조작</li>
              <li>타인의 계정을 무단으로 사용</li>
              <li>서비스의 운영을 고의로 방해</li>
              <li>다른 회원의 개인정보를 수집하거나 저장</li>
              <li>영리 목적의 광고 정보 전송</li>
              <li>회사의 동의 없이 서비스를 영리 목적으로 사용</li>
              <li>기타 관련 법령에 위배되는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제7조 (서비스 이용의 제한)</h2>
            <p>
              회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스
              이용을 제한하거나 회원 자격을 상실시킬 수 있습니다.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-4">
              <h3 className="font-medium text-red-400 mb-2">부정 체크인 경고</h3>
              <p className="text-red-300/80">
                GPS 스푸핑, QR 코드 위조, 영수증 조작 등 부정한 방법으로 체크인을 시도하는 경우,
                즉시 계정이 정지되며 법적 조치가 취해질 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제8조 (서비스의 변경 및 중단)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                회사는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 변경 또는 중단 내용을
                서비스 내 공지합니다.
              </li>
              <li>
                회사는 천재지변, 시스템 장애 등 불가피한 사유로 서비스 제공이 불가능한 경우 서비스를
                일시적으로 중단할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제9조 (지적재산권)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
              <li>회원이 서비스 내에 게시한 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.</li>
              <li>
                회사는 서비스 운영, 개선, 프로모션 목적으로 회원의 콘텐츠를 사용할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제10조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우
                책임이 면제됩니다.
              </li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
              <li>
                회사는 회원 간 또는 회원과 제3자 간에 발생한 분쟁에 대하여 개입할 의무가 없습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제11조 (분쟁 해결)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                회사와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법원을 관할법원으로 합니다.
              </li>
              <li>회사와 회원 간에 발생한 분쟁에 대하여는 대한민국 법을 적용합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">부칙</h2>
            <p>본 약관은 2024년 12월 4일부터 시행됩니다.</p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/" className="text-flame-500 hover:underline">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
