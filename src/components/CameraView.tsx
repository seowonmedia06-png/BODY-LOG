import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  RefreshCw,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CameraViewProps {
  onClose: () => void;
  onSaveRecord: (data: {
    weight: number;
    skeletalMuscle: number;
    bodyFatPercent: number;
    bodyFatMass: number;
    bmi: number;
    visceralFat: number;
    sourceType: 'camera' | 'gallery' | 'file';
  }) => void;
  sourceType: 'camera' | 'gallery' | 'file';
}

export const CameraView: React.FC<CameraViewProps> = ({
  onClose,
  onSaveRecord,
  sourceType,
}) => {
  const [step, setStep] = useState<'capturing' | 'scanning' | 'confirm'>(
    sourceType === 'camera' ? 'capturing' : 'scanning'
  );
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Editable parsed data strings to allow user-directed inputs
  const [weightStr, setWeightStr] = useState('68.5');
  const [skeletalMuscleStr, setSkeletalMuscleStr] = useState('29.8');
  const [bodyFatPercentStr, setBodyFatPercentStr] = useState('22.4');
  const [bodyFatMassStr, setBodyFatMassStr] = useState('15.3');
  const [bmiStr, setBmiStr] = useState('23.2');
  const [visceralFatStr, setVisceralFatStr] = useState('5');
  const [validationError, setValidationError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup camera if capturing
  useEffect(() => {
    if (sourceType === 'camera' && step === 'capturing') {
      let isMounted = true;

      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (!isMounted) return;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setHasCameraStream(true);
        })
        .catch((err) => {
          console.log('Camera permission or device not available in iframe:', err);
          setCameraError('카메라를 불러올 수 없어 가상 스캐너 모드로 전환합니다.');
          setHasCameraStream(false);
        });

      return () => {
        isMounted = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [sourceType, step]);

  // Automated scanning simulation progression
  useEffect(() => {
    if (step === 'scanning') {
      const timers = [
        setTimeout(() => setScanStepIndex(1), 500),
        setTimeout(() => setScanStepIndex(2), 1000),
        setTimeout(() => setScanStepIndex(3), 1500),
        setTimeout(() => setStep('confirm'), 2000),
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [step]);

  const handleCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setStep('scanning');
  };

  const handleSave = () => {
    setValidationError(null);
    const weightNum = parseFloat(weightStr);
    const muscleNum = parseFloat(skeletalMuscleStr);
    const fatNum = parseFloat(bodyFatPercentStr);
    const fatMassNum = parseFloat(bodyFatMassStr);
    const bmiNum = parseFloat(bmiStr);
    const visceralNum = parseInt(visceralFatStr, 10);

    if (isNaN(weightNum) || weightNum <= 0) {
      setValidationError('유효한 체중(kg)을 입력해주세요.');
      return;
    }

    onSaveRecord({
      weight: Number(weightNum.toFixed(1)),
      skeletalMuscle: !isNaN(muscleNum) ? Number(muscleNum.toFixed(1)) : 0,
      bodyFatPercent: !isNaN(fatNum) ? Number(fatNum.toFixed(1)) : 0,
      bodyFatMass: !isNaN(fatMassNum) ? Number(fatMassNum.toFixed(1)) : 0,
      bmi: !isNaN(bmiNum) ? Number(bmiNum.toFixed(1)) : 0,
      visceralFat: !isNaN(visceralNum) ? visceralNum : 0,
      sourceType,
    });
  };

  const scanSteps = [
    '결과지 영역 자동 정렬 및 수평 보정 중...',
    '체중, 골격근량, 체지방률 수치 OCR 식별 중...',
    '상세 지표 (BMI, 내장지방 레벨) 정밀 검증 중...',
    '신체 조성 데이터 분석 완료!',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1b1b] text-white flex flex-col justify-between">
      {/* Top Bar */}
      <div className="h-14 px-4 flex items-center justify-between z-10 pt-safe">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-[#3867f4]" />
          <span className="font-semibold text-[16px]">
            {step === 'capturing'
              ? '결과지 촬영'
              : step === 'scanning'
              ? 'AI 스마트 스캔'
              : '추출 결과 확인 및 수정'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {step === 'capturing' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Viewfinder Frame */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#242323] border-2 border-dashed border-[#3867f4] flex items-center justify-center shadow-2xl">
              {hasCameraStream ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#3867f4]/20 flex items-center justify-center text-[#3867f4]">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-[14px] font-medium text-white/90">
                    인바디 결과지를 안내선 안에 맞춰주세요
                  </p>
                  {cameraError && (
                    <p className="text-[12px] text-white/60">{cameraError}</p>
                  )}
                  {/* Result Sheet Graphic */}
                  <div className="w-36 h-44 bg-white/10 rounded-lg p-2 flex flex-col justify-between border border-white/20">
                    <div className="h-2 bg-[#3867f4] rounded w-2/3" />
                    <div className="space-y-1">
                      <div className="h-1 bg-white/30 rounded w-full" />
                      <div className="h-1 bg-white/30 rounded w-5/6" />
                      <div className="h-1 bg-white/30 rounded w-4/6" />
                    </div>
                    <div className="h-3 bg-white/20 rounded w-full flex items-center justify-end px-1">
                      <div className="w-2 h-2 rounded-full bg-[#3867f4]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Viewfinder Corner Accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white rounded-br" />
            </div>

            <p className="text-[13px] text-white/70 mt-4 text-center">
              수평을 맞추고 글자가 선명하게 보이도록 촬영해주세요
            </p>
          </div>
        )}

        {step === 'scanning' && (
          <div className="w-full max-w-sm flex flex-col items-center py-6">
            <div className="relative w-64 h-80 bg-[#313030] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between p-4">
              <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-semibold text-white/80">INBODY RESULT SCAN</span>
                <Sparkles className="w-3.5 h-3.5 text-[#3867f4]" />
              </div>

              <div className="space-y-3 my-auto">
                <div className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[12px] text-white/70">체중 영역</span>
                  <span className="text-[14px] font-bold text-white font-mono">{weightStr} kg</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[12px] text-white/70">골격근량 영역</span>
                  <span className="text-[14px] font-bold text-white font-mono">{skeletalMuscleStr} kg</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[12px] text-white/70">체지방률 영역</span>
                  <span className="text-[14px] font-bold text-white font-mono">{bodyFatPercentStr} %</span>
                </div>
              </div>

              {/* Animated Laser Scan Bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-[#3867f4] shadow-[0_0_12px_#3867f4] animate-bounce" />
            </div>

            <div className="mt-6 flex flex-col items-center text-center space-y-2">
              <div className="flex items-center gap-2 text-[#3867f4] font-semibold text-[15px]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#3867f4]" />
                <span>{scanSteps[scanStepIndex]}</span>
              </div>
              <p className="text-[12px] text-white/60">
                결과지에서 핵심 체성분 지표를 정밀 분석하고 있습니다
              </p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="w-full max-w-sm bg-[#242323] rounded-2xl p-5 border border-white/15 shadow-2xl flex flex-col space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <CheckCircle2 className="w-5 h-5 text-[#3867f4]" />
              <h3 className="text-[16px] font-bold text-white">
                추출된 측정 결과 확인
              </h3>
            </div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              분석된 수치를 확인하고 필요 시 직접 수정한 후 저장하세요. 저장하기를 누르기 전까지는 기록에 추가되지 않습니다.
            </p>

            {validationError && (
              <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-[12px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {/* Weight input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">체중 (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>

              {/* Skeletal Muscle input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">골격근량 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={skeletalMuscleStr}
                  onChange={(e) => setSkeletalMuscleStr(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>

              {/* Body fat percent input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">체지방률 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercentStr}
                  onChange={(e) => setBodyFatPercentStr(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>

              {/* Body fat mass input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">체지방량 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatMassStr}
                  onChange={(e) => setBodyFatMassStr(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>

              {/* BMI input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">BMI (kg/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bmiStr}
                  onChange={(e) => setBmiStr(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>

              {/* Visceral fat input */}
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <label className="text-[11px] text-white/60 block">내장지방 (Lv)</label>
                <input
                  type="number"
                  step="1"
                  value={visceralFatStr}
                  onChange={(e) => setVisceralFatStr(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-[18px] font-bold text-white focus:outline-none mt-0.5"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-5 pb-safe z-10 bg-[#1c1b1b]/95 border-t border-white/10">
        {step === 'capturing' && (
          <div className="flex items-center justify-center">
            <button
              id="btn-trigger-capture"
              type="button"
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-[#3867f4] flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>
          </div>
        )}

        {step === 'scanning' && (
          <div className="flex justify-center">
            <button
              type="button"
              disabled
              className="w-full max-w-sm h-12 rounded-xl bg-white/20 text-white/80 font-medium flex items-center justify-center gap-2 cursor-wait"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>분석 진행 중...</span>
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
            <button
              id="btn-save-scanned-record"
              type="button"
              onClick={handleSave}
              className="w-full h-14 rounded-xl bg-[#3867f4] hover:bg-[#0c4cda] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg"
            >
              <Check className="w-5 h-5" />
              <span>저장하기</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-white/10 text-white font-medium text-[13px] flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              취소하고 나가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
