<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDivinationStore } from '@/stores/divination'

const route = useRoute()
const router = useRouter()
const store = useDivinationStore()

// Collapsible sections state
const showWeightExplanation = ref(false)
const showSystemConflicts = ref(true)

const resultId = computed(() => route.params.id as string)

const result = computed(() => {
  return store.getResultById(resultId.value)
})

const hasAIResult = computed(() => {
  return result.value?.aiInterpretation !== undefined
})

// Format probability level to color class
function getProbabilityClass(probability: number): string {
  if (probability >= 0.5) return 'high'
  if (probability >= 0.15) return 'medium'
  return 'low'
}

// Parse AI content into sections for multi-path display
function parseAISections(content: string): string[] {
  if (!content) return []
  // Split by 【】 section headers
  const sections = content.split(/(?=【[^】]+】)/)
  return sections.filter(s => s.trim())
}

// 格式化AI解读内容（简单 Markdown 转 HTML）
function formatAIContent(content: string): string {
  if (!content) return ''
  return content
    .replace(/\n/g, '<br>')
    .replace(/【(.+?)】/g, '<strong style="color:#d4af37">【$1】</strong>')
    .replace(/(✓|✅|利好|吉)/g, '<span style="color:#2ecc71">$1</span>')
    .replace(/(✗|❌|不利|凶)/g, '<span style="color:#e74c3c">$1</span>')
    .replace(/(△|⚠️|注意|慎)/g, '<span style="color:#f39c12">$1</span>')
    .replace(/《(.+?)》/g, '<em style="color:#d4af37">《$1》</em>')
}

// 爻位名称映射（从下往上，position 1-6）
const yaoPositionNames = ['初', '二', '三', '四', '五', '上']

// 爻辞数据库（64卦爻辞，key为卦名，value为6条爻辞数组从下到上）
const yaoTexts: Record<string, string[]> = {
  '乾': ['潜龙勿用', '见龙在田，利见大人', '君子终日乾乾，夕惕若厉，无咎', '或跃在渊，无咎', '飞龙在天，利见大人', '亢龙有悔'],
  '坤': ['履霜，坚冰至', '直，方，大，不习无不利', '含章可贞，或从王事，无成有终', '括囊，无咎无誉', '黄裳，元吉', '龙战于野，其血玄黄'],
  '屯': ['磐桓，利居贞，利建侯', '屯如邅如，乘马班如，匪寇婚媾', '即鹿无虞，惟入于林中', '乘马班如，求婚媾，往吉无不利', '屯其膏，小贞吉，大贞凶', '乘马班如，泣血涟如'],
  '蒙': ['发蒙，利用刑人，用说桎梏', '包蒙吉，纳妇吉', '勿用取女，见金夫，不有躬', '困蒙，吝', '童蒙，吉', '击蒙，不利为寇，利御寇'],
  '需': ['需于郊，利用恒', '需于沙，小有言，终吉', '需于泥，致寇至', '需于血，出自穴', '需于酒食，贞吉', '入于穴，有不速之客三人来'],
  '讼': ['不永所事，小有言，终吉', '不克讼，归而逋，其邑人三百户无眚', '食旧德，贞厉，终吉', '不克讼，复即命渝，安贞吉', '讼，元吉', '或锡之鞶带，终朝三褫之'],
  '师': ['师出以律，否臧凶', '在师中吉，无咎', '师或舆尸，凶', '师左次，无咎', '田有禽，利执言', '大君有命，开国承家'],
  '比': ['比之自内，贞吉', '比之自外，吉', '比之匪人', '外比之，贞吉', '显比，王用三驱', '比之无首，凶'],
  '小畜': ['复自道，何其咎', '牵复，吉', '舆说辐，夫妻反目', '有孚，血去惕出，无咎', '有孚挛如，富以其邻', '既雨既处，尚德载'],
  '履': ['素履，往无咎', '履道坦坦，幽人贞吉', '眇能视，跛能履', '履虎尾，愬愬终吉', '夬履，贞厉', '视履考祥，其旋元吉'],
  '泰': ['拔茅茹以其汇', '包荒，用冯河，不遐遗', '无平不陂，无往不复', '翩翩不富以其邻', '帝乙归妹，以祉元吉', '城复于隍'],
  '否': ['拔茅茹以其汇', '包承，小人吉，大人否亨', '包羞', '有命，无咎', '休否，大人吉', '倾否'],
  '同人': ['同人于门', '同人于宗，吝', '伏戎于莽，升其高陵', '乘其墉，弗克攻', '同人先号咷而后笑', '同人于郊'],
  '大有': ['无交害', '大车以载，有攸往', '公用亨于天子', '匪其彭，无咎', '厥孚交如威如', '自天祐之，吉无不利'],
  '谦': ['谦谦君子，用涉大川，吉', '鸣谦，贞吉', '劳谦，君子有终', '无不利，撝谦', '不富以其邻', '鸣谦，利用行师'],
  '豫': ['鸣豫，凶', '介于石，不终日', '盱豫悔，迟有悔', '由豫，大有得', '贞疾，恒不死', '冥豫成，有渝无咎'],
  '随': ['官有渝，贞吉', '系小子，失丈夫', '系丈夫，失小子', '随有获，贞凶', '孚于嘉，吉', '拘系之，乃从维之'],
  '蛊': ['干父之蛊，有子', '干母之蛊，不可贞', '干父之蛊，小有悔', '裕父之蛊，往见吝', '干父之蛊，用誉', '不事王侯，高尚其事'],
  '临': ['咸临，贞吉', '咸临，吉，无不利', '甘临，无攸利', '至临，无咎', '知临，大君之宜', '敦临，吉，无咎'],
  '观': ['童观，小人无咎', '窥观，利女贞', '观我生，进退', '观国之光', '观我生，君子无咎', '观其生，君子无咎'],
  '噬嗑': ['屦校灭趾', '噬肤灭鼻', '噬腊肉，遇毒', '噬干胏，得金矢', '噬干肉，得黄金', '何校灭耳，凶'],
  '贲': ['贲其趾，舍车而徒', '贲其须', '贲如濡如', '贲如皤如，白马翰如', '贲于丘园，束帛戋戋', '白贲，无咎'],
  '剥': ['剥床以足，蔑贞凶', '剥床以辨，蔑贞凶', '剥之，无咎', '剥床以肤，凶', '贯鱼以宫人宠', '硕果不食'],
  '复': ['不远复，无祗悔', '休复，吉', '频复，厉，无咎', '中行独复', '敦复，无悔', '迷复，凶'],
  '无妄': ['无妄往，吉', '不耕获，不菑畲', '无妄之灾，或系之牛', '可贞，无咎', '无妄之疾，勿药有喜', '无妄行，有眚'],
  '大畜': ['有厉，利已', '舆说辐', '良马逐，利艰贞', '童牛之牿，元吉', '豶豕之牙，吉', '何天之衢'],
  '颐': ['舍尔灵龟，观我朵颐', '颠颐，拂经于丘颐', '拂颐，贞凶', '颠颐，吉', '拂经，居贞吉', '由颐，厉吉'],
  '大过': ['藉用白茅，无咎', '枯杨生稊，老夫得其女妻', '栋桡，凶', '栋隆，吉', '枯杨生华，老妇得其士夫', '过涉灭顶，凶'],
  '坎': ['习坎，入于坎窞', '坎有险，求小得', '来之坎坎，险且枕', '樽酒簋贰', '坎不盈，祗既平', '系用徽纆，寘于丛棘'],
  '离': ['履错然，敬之无咎', '黄离，元吉', '日昃之离，不鼓缶而歌', '突如其来如，焚如死如弃如', '出涕沱若，戚嗟若', '王用出征'],
  '咸': ['咸其拇', '咸其腓，凶', '咸其股，执其随', '贞吉悔亡', '咸其脢，无悔', '咸其辅颊舌'],
  '恒': ['浚恒，贞凶', '悔亡', '不恒其德，或承之羞', '田无禽', '恒其德，贞', '振恒，凶'],
  '遯': ['遯尾，厉', '执之用黄牛之革', '系遯，有疾厉', '好遯，君子吉', '嘉遯，贞吉', '肥遯，无不利'],
  '大壮': ['壮于趾，征凶', '贞吉', '小人用壮，君子用罔', '贞吉悔亡', '丧羊于易，无悔', '羝羊触藩，不能退'],
  '晋': ['晋如摧如，贞吉', '晋如愁如，受兹介福', '众允，悔亡', '晋如鼫鼠，贞厉', '悔亡，失得勿恤', '晋其角'],
  '明夷': ['明夷于飞，垂其翼', '明夷，夷于左股', '明夷，得其大首', '入于左腹', '箕子之明夷', '不明，晦，初登于天，后入于地'],
  '家人': ['闲有家，悔亡', '无攸遂，在中馈', '家人嗃嗃，悔厉', '富家，大吉', '王假有家，勿恤', '有孚威如'],
  '睽': ['丧马勿逐，自复', '遇主于巷，无咎', '见舆曳，其牛掣', '睽孤，遇元夫', '悔亡，厥宗噬肤', '睽孤，见豕负涂'],
  '蹇': ['往蹇来誉', '王臣蹇蹇，匪躬之故', '往蹇来反', '往蹇来连', '大蹇朋来', '往蹇来硕'],
  '解': ['无咎', '田获三狐，得黄矢', '负且乘，致寇至', '解而拇，朋至斯孚', '君子维有解，吉', '公用射隼于高墉之上'],
  '损': ['已事遄往，无咎', '利贞，征凶', '三人行则损一人', '损其疾，使遄有喜', '或益之十朋之龟', '弗损益之'],
  '益': ['利用为大作', '或益之十朋之龟', '益之用凶事，无咎', '中行告公从', '有孚惠心，勿问元吉', '莫益之，或击之'],
  '夬': ['壮于前趾', '惕号，莫夜有戎', '壮于頄，有凶', '臀无肤，其行次且', '苋陆夬夬，中行无咎', '无号，终有凶'],
  '姤': ['系于金柅', '包有鱼，无咎', '臀无肤，其行次且', '包无鱼，起凶', '以杞包瓜，有陨自天', '姤其角'],
  '萃': ['有孚不终', '引吉，无咎', '萃如嗟如', '大吉，无咎', '萃有位，无咎', '赍咨涕洟'],
  '升': ['允升，大吉', '孚乃利用禴', '升虚邑', '王用亨于岐山', '贞吉，升阶', '冥升，利于不息之贞'],
  '困': ['臀困于株木', '困于酒食，朱绂方来', '困于石，据于蒺藜', '来徐徐，困于金车', '劓刖，困于赤绂', '困于葛藟'],
  '井': ['井泥不食', '井谷射鲋，瓮敝漏', '井渫不食，为我心恻', '井甃，无咎', '井冽寒泉食', '井收勿幕，有孚元吉'],
  '革': ['巩用黄牛之革', '已日乃革之', '征凶，贞厉', '悔亡，有孚改命', '大人虎变', '君子豹变'],
  '鼎': ['鼎颠趾，利出否', '鼎有实，我仇有疾', '鼎耳革，其行塞', '鼎折足，覆公餗', '鼎黄耳金铉', '鼎玉铉'],
  '震': ['震来虩虩，笑言哑哑', '震来厉，亿丧贝', '震苏苏，震行无眚', '震遂泥', '震往来厉，亿无丧', '震索索，视矍矍'],
  '艮': ['艮其趾，无咎', '艮其腓，不拯其随', '艮其限，列其夤', '艮其身，无咎', '艮其辅，言有序', '敦艮，吉'],
  '渐': ['鸿渐于干', '鸿渐于磐', '鸿渐于陆', '鸿渐于木', '鸿渐于陵', '鸿渐于陆'],
  '归妹': ['归妹以娣，跛能履', '眇能视，利幽人之贞', '归妹以须，反归以娣', '归妹愆期，迟归有时', '帝乙归妹，其君之袂不如其娣之袂良', '女承筐无实，士刲羊无血'],
  '丰': ['遇其配主，虽旬无咎', '丰其蔀，日中见斗', '丰其沛，日中见沬', '丰其蔀，日中见斗', '来章，有庆誉', '丰其屋，蔀其家'],
  '旅': ['旅琐琐，斯其所取灾', '旅即次，怀其资', '旅焚其次，丧其童仆', '旅于处，得其资斧', '射雉一矢亡，终以誉命', '鸟焚其巢，旅人先笑后号咷'],
  '巽': ['进退，利武人之贞', '巽在床下，用史巫纷若', '频巽，吝', '悔亡，田获三品', '贞吉悔亡，无不利', '巽在床下，丧其资斧'],
  '兑': ['和兑，吉', '孚兑，吉', '来兑，凶', '商兑未宁', '孚于剥，有厉', '引兑'],
  '涣': ['用拯马壮，吉', '涣奔其机，悔亡', '涣其躬，无悔', '涣其群，元吉', '涣汗其大号', '涣其血，去逖出'],
  '节': ['不出户庭，无咎', '不出门庭，凶', '不节若，则嗟若', '安节，亨', '甘节，吉', '苦节，贞凶'],
  '中孚': ['虞吉，有它不燕', '鹤鸣在阴，其子和之', '得敌，或鼓或罢', '月几望，马匹亡', '有孚挛如，无咎', '翰音登于天'],
  '小过': ['飞鸟以凶', '过其祖，遇其妣', '弗过防之，从或戕之', '无咎，弗过遇之', '密云不雨，自我西郊', '弗遇过之，飞鸟离之'],
  '既济': ['曳其轮，濡其尾', '妇丧其茀，勿逐，七日得', '高宗伐鬼方', '繻有衣袽', '东邻杀牛，不如西邻之禴祭', '濡其首，厉'],
  '未济': ['濡其尾，吝', '曳其轮，贞吉', '未济，征凶', '贞吉，悔亡，震用伐鬼方', '贞吉，无悔', '有孚于饮酒'],
}

function getYaoName(posIndex: number, isYang: boolean): string {
  // posIndex 0-5 maps to positions 1-6 (bottom to top)
  const prefix = isYang ? '九' : '六'
  const posName = yaoPositionNames[posIndex]
  if (posIndex === 0) return '初' + (isYang ? '九' : '六')
  if (posIndex === 5) return '上' + (isYang ? '九' : '六')
  return posName + (isYang ? '九' : '六')
}

function getLineTooltipData(posIndex: number, isYang: boolean, hexagramName: string) {
  const position = posIndex + 1
  const yaoName = getYaoName(posIndex, isYang)
  const type = isYang ? '阳爻' : '阴爻'
  const texts = yaoTexts[hexagramName]
  const yaoText = texts && texts[posIndex] ? texts[posIndex] : '—'
  return { yaoName, type, yaoText, position }
}
</script>

<template>
  <div v-if="result" class="result-view">
    <!-- 卦象展示 -->
    <section class="hexagram-section">
      <div class="hexagram-display">
        <div class="primary-hexagram">
          <div class="hexagram-name">{{ result.hexagram.primary }}</div>
          <div class="hexagram-lines">
            <div
              v-for="(line, idx) in [...result.hexagram.lines].reverse()"
              :key="idx"
              class="hexagram-line-wrapper"
            >
              <div
                class="hexagram-line"
                :class="{
                  'yang': line,
                  'yin': !line,
                  'changing': result.hexagram.changingLines.includes(6 - idx)
                }"
              >
                <template v-if="line">
                  <span class="yang-solid"></span>
                </template>
                <template v-else>
                  <span class="yin-left"></span>
                  <span class="yin-gap"></span>
                  <span class="yin-right"></span>
                </template>
              </div>
              <div class="hexagram-tooltip">
                <div class="tooltip-name">
                  {{ getYaoName(5 - idx, line) }}
                </div>
                <div class="tooltip-type">{{ line ? '阳爻' : '阴爻' }}</div>
                <div
                  v-if="result.hexagram.changingLines.includes(6 - idx)"
                  class="tooltip-changing"
                >
                  ⚡ 动爻
                </div>
                <div class="tooltip-yao-text">
                  {{ yaoTexts[result.hexagram.primary]?.[5 - idx] || '—' }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="result.hexagram.changingLines.length > 0" class="changing-info">
            第 {{ result.hexagram.changingLines.join('、') }} 爻动
          </div>
        </div>
        <div v-if="result.hexagram.secondary" class="arrow">→</div>
        <div v-if="result.hexagram.secondary" class="secondary-hexagram">
          <div class="hexagram-name">{{ result.hexagram.secondary }}</div>
          <div class="hexagram-symbol">↻</div>
          <div class="changing-label">变卦</div>
        </div>
      </div>
      
      <div class="hexagram-meta">
        <div class="meta-item">
          <span class="meta-label">本卦</span>
          <span class="meta-value">{{ result.hexagram.primary }}</span>
        </div>
        <div v-if="result.hexagram.secondary" class="meta-item">
          <span class="meta-label">变卦</span>
          <span class="meta-value">{{ result.hexagram.secondary }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">问卦人</span>
          <span class="meta-value">{{ result.context.core?.name }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">问事时间</span>
          <span class="meta-value">{{ new Date(result.timestamp).toLocaleString('zh-CN') }}</span>
        </div>
      </div>
    </section>

    <!-- 权重逻辑 -->
    <section v-if="result.weightExplanation" class="weight-section">
      <div class="collapsible-header" @click="showWeightExplanation = !showWeightExplanation">
        <h3>⚖️ 本次卜算权重逻辑</h3>
        <span class="toggle-icon">{{ showWeightExplanation ? '▾' : '▸' }}</span>
      </div>
      <transition name="expand">
        <div v-if="showWeightExplanation" class="weight-content">
          <div class="weight-bars">
            <div class="weight-bar-row">
              <span class="weight-label">👤 人事权重</span>
              <div class="weight-bar-track">
                <div class="weight-bar-fill" :style="{ width: (result.weightExplanation.personWeight || 0.35) * 100 + '%' }"></div>
              </div>
              <span class="weight-value">{{ Math.round((result.weightExplanation.personWeight || 0.35) * 100) }}%</span>
            </div>
            <div class="weight-bar-row">
              <span class="weight-label">🌍 时势权重</span>
              <div class="weight-bar-track">
                <div class="weight-bar-fill" :style="{ width: (result.weightExplanation.situationWeight || 0.25) * 100 + '%' }"></div>
              </div>
              <span class="weight-value">{{ Math.round((result.weightExplanation.situationWeight || 0.25) * 100) }}%</span>
            </div>
            <div class="weight-bar-row">
              <span class="weight-label">⏳ 时间权重</span>
              <div class="weight-bar-track">
                <div class="weight-bar-fill" :style="{ width: (result.weightExplanation.timingWeight || 0.20) * 100 + '%' }"></div>
              </div>
              <span class="weight-value">{{ Math.round((result.weightExplanation.timingWeight || 0.20) * 100) }}%</span>
            </div>
            <div class="weight-bar-row">
              <span class="weight-label">🧠 心念权重</span>
              <div class="weight-bar-track">
                <div class="weight-bar-fill" :style="{ width: (result.weightExplanation.mentalWeight || 0.20) * 100 + '%' }"></div>
              </div>
              <span class="weight-value">{{ Math.round((result.weightExplanation.mentalWeight || 0.20) * 100) }}%</span>
            </div>
          </div>
          <p v-if="result.weightExplanation.description" class="weight-description">{{ result.weightExplanation.description }}</p>
        </div>
      </transition>
    </section>

    <!-- 系统冲突 -->
    <section v-if="result.systemConflicts && result.systemConflicts.length > 0" class="conflicts-section">
      <div class="collapsible-header conflicts-header" @click="showSystemConflicts = !showSystemConflicts">
        <h3>⚠️ 系统冲突警告</h3>
        <span class="toggle-icon">{{ showSystemConflicts ? '▾' : '▸' }}</span>
      </div>
      <transition name="expand">
        <div v-if="showSystemConflicts" class="conflicts-content">
          <div v-for="(conflict, idx) in result.systemConflicts" :key="idx" class="conflict-card">
            <div class="conflict-systems">
              <span v-for="(sys, si) in conflict.systems" :key="si" class="conflict-system-tag">{{ sys }}</span>
              <span class="conflict-type-label">冲突类型：{{ conflict.conflictType }}</span>
            </div>
            <div class="conflict-warning">⚠️ {{ conflict.warning }}</div>
            <div class="conflict-resolution">💡 <strong>化解建议：</strong>{{ conflict.resolution }}</div>
          </div>
        </div>
      </transition>
    </section>

    <!-- 六层分析 -->
    <section class="layers-section">
      <h3>六层分析</h3>
      
      <!-- 义理层 -->
      <div class="layer-card">
        <h4>📊 义理层 - {{ result.layers.yiLi.auspiciousness }}</h4>
        <p class="trend">{{ result.layers.yiLi.trendDescription }}</p>
        <div class="timeframe">
          <div><span>生效：</span>{{ result.layers.yiLi.timeFrame.effective }}</div>
          <div><span>转折：</span>{{ result.layers.yiLi.timeFrame.transition }}</div>
          <div><span>应期：</span>{{ result.layers.yiLi.timeFrame.deadline }}</div>
        </div>
        <div v-if="result.layers.yiLi.timeFrame.probabilityRanges && result.layers.yiLi.timeFrame.probabilityRanges.length > 0" class="probability-ranges">
          <div v-for="(range, idx) in result.layers.yiLi.timeFrame.probabilityRanges" :key="idx" class="prob-range-row">
            <span class="prob-period">{{ range.period }}</span>
            <div class="prob-bar-track">
              <div class="prob-bar-fill" :class="getProbabilityClass(range.probability)" :style="{ width: Math.round(range.probability * 100) + '%' }"></div>
            </div>
            <span class="prob-value">{{ Math.round(range.probability * 100) }}%</span>
            <span v-if="range.condition" class="prob-condition">{{ range.condition }}</span>
          </div>
        </div>
        <div class="advice">
          <p><strong>行动：</strong>{{ result.layers.yiLi.advice.action }}</p>
          <p><strong>时机：</strong>{{ result.layers.yiLi.advice.timing }}</p>
          <p><strong>注意：</strong>{{ result.layers.yiLi.advice.caution }}</p>
        </div>
      </div>

      <!-- 机变层 -->
      <div class="layer-card">
        <h4>🔄 机变层</h4>
        <p>{{ result.layers.jiBian.pattern }}</p>
        <div v-if="result.layers.jiBian.variables.changing.length > 0" class="variables">
          <p><strong>变化因素：</strong>{{ result.layers.jiBian.variables.changing.join('、') }}</p>
        </div>
      </div>

      <!-- 取象层 -->
      <div class="layer-card">
        <h4>🎯 取象层</h4>
        <div class="images-grid">
          <div><span>主象：</span>{{ result.layers.quXiang.primarySymbol }}</div>
          <div><span>辅象：</span>{{ result.layers.quXiang.secondarySymbols.join('、') }}</div>
          <div><span>自然：</span>{{ result.layers.quXiang.images.nature }}</div>
          <div><span>人事：</span>{{ result.layers.quXiang.images.human }}</div>
        </div>
      </div>

      <!-- 体用层 -->
      <div class="layer-card">
        <h4>⚖️ 体用层</h4>
        <div class="tiyong-grid">
          <div class="tiyong-item">
            <h5>体（本命）</h5>
            <p>日主：{{ result.layers.tiYong.body.dayMaster }}</p>
            <p>主导五行：{{ result.layers.tiYong.body.fiveElements.dominant }}</p>
          </div>
          <div class="tiyong-item">
            <h5>用（问事）</h5>
            <p>{{ result.layers.tiYong.application.questionCategory }}</p>
          </div>
          <div class="tiyong-item">
            <h5>机（时空）</h5>
            <p>天时：{{ result.layers.tiYong.opportunity.timing }}</p>
            <p>地利：{{ result.layers.tiYong.opportunity.location }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 典籍引用 -->
    <section class="citations-section">
      <h3>📚 典籍出处</h3>
      <div v-for="(citation, index) in result.citations" :key="index" class="citation-card">
        <div class="citation-header">
          <span class="citation-title">《{{ citation.title }}》</span>
          <span v-if="citation.chapter" class="citation-chapter">{{ citation.chapter }}</span>
          <span class="citation-relevance">相关度 {{ Math.round(citation.relevance * 100) }}%</span>
        </div>
        <div class="citation-quote">{{ citation.quote }}</div>
        <div class="citation-translation">{{ citation.translation }}</div>
      </div>
    </section>

    <!-- AI智能解读 -->
    <section class="ai-section">
      <h3>🤖 AI智能解读</h3>
      <div v-if="hasAIResult" class="ai-card">
        <div class="ai-meta">
          <span>模型：{{ result.aiInterpretation?.modelUsed }}</span>
          <span>耗时：{{ Math.round((result.aiInterpretation?.latency || 0) / 1000) }}s</span>
        </div>
        <div class="ai-content multi-path-content">
          <div v-for="(section, idx) in parseAISections(result.aiInterpretation?.content || '')" :key="idx" class="ai-section-block">
            <div v-html="formatAIContent(section)"></div>
          </div>
        </div>
      </div>
      <div v-else class="ai-card ai-empty">
        <p>💡 AI解读未启用</p>
        <p>请先到 <router-link to="/settings">设置</router-link> 页面配置AI提供商并保存，然后重新起卦即可获得AI智能解读。</p>
        <router-link to="/divination" class="btn btn-sm btn-gold">重新起卦</router-link>
      </div>
    </section>

    <!-- 个性化指引 -->
    <section v-if="result.conclusion && (result.conclusion.directionAdvice || result.conclusion.colorAdvice || result.conclusion.mentalAdvice)" class="advice-section">
      <h3>🧭 个性化指引</h3>
      <div class="advice-cards-grid">
        <div v-if="result.conclusion.directionAdvice" class="advice-feature-card">
          <div class="advice-feature-icon">🧭</div>
          <div class="advice-feature-title">方位建议</div>
          <div class="advice-feature-content">{{ result.conclusion.directionAdvice }}</div>
        </div>
        <div v-if="result.conclusion.colorAdvice" class="advice-feature-card">
          <div class="advice-feature-icon">🎨</div>
          <div class="advice-feature-title">颜色建议</div>
          <div class="advice-feature-content">{{ result.conclusion.colorAdvice }}</div>
        </div>
        <div v-if="result.conclusion.mentalAdvice" class="advice-feature-card">
          <div class="advice-feature-icon">🧘</div>
          <div class="advice-feature-title">心念调整</div>
          <div class="advice-feature-content">{{ result.conclusion.mentalAdvice }}</div>
        </div>
      </div>
    </section>

    <!-- 免责声明 -->
    <section class="disclaimer-section">
      <div class="disclaimer-box">
        <h4>⚠️ 免责声明</h4>
        <pre>{{ result.disclaimer }}</pre>
      </div>
    </section>
  </div>

  <div v-else class="not-found">
    <h2>未找到结果</h2>
    <p>该卦象记录不存在或已被删除</p>
    <router-link to="/history" class="btn btn-primary">查看历史</router-link>
  </div>
</template>

<style scoped>
.result-view {
  max-width: 900px;
  margin: 0 auto;
}

/* Hexagram Display */
.hexagram-section {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.hexagram-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.primary-hexagram,
.secondary-hexagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hexagram-name {
  font-size: 2rem;
  font-weight: 600;
  color: #d4af37;
}

.hexagram-symbol {
  font-size: 3rem;
  line-height: 1;
  letter-spacing: -0.2em;
}

.secondary-hexagram .hexagram-symbol {
  color: #888;
}

.changing-info,
.changing-label {
  font-size: 0.9rem;
  color: #888;
}

.arrow {
  font-size: 2rem;
  color: #d4af37;
}

.hexagram-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.8rem;
  color: #666;
}

.meta-value {
  font-size: 1rem;
  color: #e8e8e8;
}

/* Weight Explanation */
.weight-section {
  margin-bottom: 2rem;
}

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 1rem 1.5rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  transition: background 0.2s;
}

.collapsible-header:hover {
  background: rgba(212, 175, 55, 0.1);
}

.collapsible-header h3 {
  margin: 0;
  color: #d4af37;
  font-size: 1.15rem;
}

.toggle-icon {
  color: #d4af37;
  font-size: 1.2rem;
}

.weight-content {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.weight-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weight-bar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weight-label {
  min-width: 120px;
  color: #a0a0a0;
  font-size: 0.9rem;
}

.weight-bar-track {
  flex: 1;
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
}

.weight-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #b8960f, #d4af37, #f0d060);
  border-radius: 6px;
  transition: width 0.6s ease;
}

.weight-value {
  min-width: 45px;
  text-align: right;
  color: #d4af37;
  font-weight: 600;
  font-size: 0.9rem;
}

.weight-description {
  margin-top: 1rem;
  color: #888;
  font-size: 0.85rem;
  line-height: 1.6;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Transitions */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* System Conflicts */
.conflicts-section {
  margin-bottom: 2rem;
}

.conflicts-header {
  border-color: rgba(243, 156, 18, 0.25);
  background: rgba(243, 156, 18, 0.05);
}

.conflicts-header:hover {
  background: rgba(243, 156, 18, 0.1);
}

.conflicts-header h3 {
  color: #f39c12;
}

.conflicts-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(243, 156, 18, 0.05);
  border: 1px solid rgba(243, 156, 18, 0.25);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.conflict-card {
  background: rgba(243, 156, 18, 0.08);
  border-radius: 10px;
  padding: 1.25rem;
  border-left: 4px solid #f39c12;
}

.conflict-systems {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.conflict-system-tag {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.conflict-type-label {
  color: #888;
  font-size: 0.85rem;
  margin-left: auto;
}

.conflict-warning {
  color: #f39c12;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.conflict-resolution {
  color: #a0a0a0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Layers */
.layers-section {
  margin-bottom: 2rem;
}

.layers-section h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.layer-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.layer-card h4 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.trend {
  color: #a0a0a0;
  line-height: 1.8;
}

.timeframe {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  color: #888;
}

.timeframe span {
  color: #d4af37;
}

/* Probability Ranges */
.probability-ranges {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.prob-range-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.prob-period {
  min-width: 100px;
  color: #a0a0a0;
  font-size: 0.85rem;
}

.prob-bar-track {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  overflow: hidden;
}

.prob-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.prob-bar-fill.high {
  background: linear-gradient(90deg, #b8960f, #d4af37);
}

.prob-bar-fill.medium {
  background: linear-gradient(90deg, #999, #c0c0c0);
}

.prob-bar-fill.low {
  background: linear-gradient(90deg, #555, #777);
}

.prob-value {
  min-width: 40px;
  text-align: right;
  color: #d4af37;
  font-weight: 600;
  font-size: 0.85rem;
}

.prob-condition {
  color: #888;
  font-size: 0.8rem;
  font-style: italic;
}

.advice {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.advice p {
  margin: 0.5rem 0;
  color: #a0a0a0;
}

.images-grid,
.tiyong-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.images-grid div,
.tiyong-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  color: #a0a0a0;
}

.images-grid span {
  color: #d4af37;
}

.tiyong-item h5 {
  color: #d4af37;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Citations */
.citations-section {
  margin-bottom: 2rem;
}

.citations-section h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.citation-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.citation-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.citation-title {
  color: #d4af37;
  font-weight: 600;
}

.citation-chapter {
  color: #888;
  font-size: 0.9rem;
}

.citation-relevance {
  color: #2ecc71;
  font-size: 0.8rem;
  margin-left: auto;
}

.citation-quote {
  color: #e8e8e8;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 0.75rem;
  padding-left: 1rem;
  border-left: 3px solid #d4af37;
}

.citation-translation {
  color: #888;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* AI Section */
.ai-section {
  margin-bottom: 2rem;
}

.ai-section h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.ai-card {
  background: rgba(77, 171, 247, 0.05);
  border: 1px solid rgba(77, 171, 247, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.ai-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.ai-content {
  color: #e8e8e8;
  line-height: 1.8;
  font-size: 1rem;
}

/* Multi-path AI Content */
.multi-path-content .ai-section-block {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #d4af37;
  background: rgba(212, 175, 55, 0.03);
}

.multi-path-content .ai-section-block:last-child {
  margin-bottom: 0;
}

.ai-empty {
  text-align: center;
  padding: 2rem;
}

.ai-empty p {
  color: #888;
  margin-bottom: 0.75rem;
}

.ai-empty a {
  color: #d4af37;
  text-decoration: underline;
}

.btn-sm {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.btn-gold {
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #d4af37;
}

/* Personalized Advice Cards */
.advice-section {
  margin-bottom: 2rem;
}

.advice-section h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.advice-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.advice-feature-card {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.advice-feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
}

.advice-feature-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.advice-feature-title {
  color: #d4af37;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.advice-feature-content {
  color: #a0a0a0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Disclaimer */
.disclaimer-section {
  margin-bottom: 2rem;
}

.disclaimer-box {
  background: rgba(231, 76, 60, 0.05);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.disclaimer-box h4 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.disclaimer-box pre {
  color: #888;
  font-size: 0.85rem;
  line-height: 1.8;
  white-space: pre-wrap;
  font-family: inherit;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.not-found p {
  color: #888;
  margin-bottom: 2rem;
}
</style>
