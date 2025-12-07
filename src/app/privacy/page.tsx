'use client';

import Link from 'next/link';
import { ZzikLogo } from '@/components/cosmic';

/**
 * ZZIK 개인정보처리방침
 * App Store & Google Play 심사 필수 항목
 */
export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
        <p className="text-white/40 text-sm mb-10">최종 수정일: 2024년 12월 4일</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              ZZIK(이하 &quot;회사&quot;)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리한
              개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는 사전
              동의를 구할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>회원 가입 및 관리</li>
              <li>위치 기반 체크인 서비스 제공 (Triple Verification)</li>
              <li>QR 코드 스캔 및 검증</li>
              <li>영수증 인증 서비스</li>
              <li>여행 기록 및 통계 제공</li>
              <li>서비스 개선 및 맞춤형 서비스 제공</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">필수 항목</h3>
                <p>이메일 주소, 닉네임, 암호화된 비밀번호</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">선택 항목</h3>
                <p>프로필 사진, 소셜 로그인 정보 (Google, 카카오, Apple)</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">서비스 이용 시 수집</h3>
                <p>위치 정보 (체크인 시), 사진 (영수증 인증 시), 카메라 접근 (QR 스캔 시)</p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">자동 수집</h3>
                <p>기기 정보, 서비스 이용 기록, 접속 로그</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시 동의
              받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>체크인 기록: 수집일로부터 3년</li>
              <li>결제 기록: 전자상거래법에 따라 5년</li>
              <li>서비스 이용 로그: 3개월</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적 범위 내에서 처리하며, 다음의
              경우를 제외하고는 정보주체의 사전 동의 없이 본래의 목적 범위를 초과하여 처리하거나
              제3자에게 제공하지 않습니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>정보주체가 사전에 동의한 경우</li>
              <li>법령의 규정에 의한 경우</li>
              <li>수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. 위치정보의 이용</h2>
            <p>
              ZZIK의 Triple Verification 서비스는 위치 정보를 활용합니다. 위치 정보는 다음과 같이
              처리됩니다:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>체크인 검증을 위해 일시적으로 수집</li>
              <li>GPS 좌표는 암호화되어 저장</li>
              <li>위치 정보는 체크인 기록과 함께 보관</li>
              <li>사용자는 언제든지 위치 권한을 철회 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. 개인정보의 파기</h2>
            <p>
              회사는 개인정보 보유 기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
              <li>종이 문서: 분쇄기로 분쇄 또는 소각</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p>
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수
              있습니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-4">
              권리 행사는 앱 내 설정 또는 이메일(privacy@zzik.kr)을 통해 가능합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. 개인정보 보호책임자</h2>
            <div className="bg-white/5 rounded-xl p-6">
              <p>
                <span className="text-white">담당자:</span> 개인정보보호 담당
              </p>
              <p>
                <span className="text-white">이메일:</span> privacy@zzik.kr
              </p>
              <p>
                <span className="text-white">연락처:</span> 앱 내 문의하기
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. 개인정보처리방침 변경</h2>
            <p>
              이 개인정보처리방침은 2024년 12월 4일부터 적용됩니다. 이전의 개인정보처리방침은
              아래에서 확인하실 수 있습니다.
            </p>
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
