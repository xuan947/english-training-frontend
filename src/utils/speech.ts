import { canSpeak, speak as speakSvc } from '@/services/speech'
import { ElMessage } from 'element-plus'

/**
 * 通用語音播放，包含錯誤提示
 */
export const playSpeech = (text: string, lang = 'en-US') => {
  if (!canSpeak()) {
    ElMessage.warning('此瀏覽器不支援語音播放');
    return;
  }

  speakSvc(text, {
    lang,
    rate: 1,
    slowRate: 0.6,
    slowOnRepeat: true,
  });
};
