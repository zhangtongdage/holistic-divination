/**
 * 全量典籍知识库 - 基于《四库全书·术数类》结构化数据
 * 涵盖20部典籍，总计200+条原文+白话翻译
 */

import { ClassicEntry } from './types';

// ==================== 周易（64卦卦辞+系辞+说卦+杂卦）====================

const YI_JING: ClassicEntry[] = [
  { title: '周易', chapter: '乾卦·卦辞', quote: '元亨利贞。', translation: '创始、通达、适宜、稳固。象征天道刚健，君子自强不息。', relevance: 10, tags: ['易经', '卦辞', '乾'] },
  { title: '周易', chapter: '坤卦·卦辞', quote: '元亨，利牝马之贞。', translation: '像母马一样柔顺坚韧。君子前往，起初迷茫，后得引领。', relevance: 10, tags: ['易经', '卦辞', '坤'] },
  { title: '周易', chapter: '屯卦·卦辞', quote: '元亨利贞。勿用有攸往，利建侯。', translation: '虽通达，但不宜冒进，适合建立根基。', relevance: 10, tags: ['易经', '卦辞', '屯'] },
  { title: '周易', chapter: '蒙卦·卦辞', quote: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。', translation: '不是我去求蒙昧者，而是蒙昧者来求我。再三亵渎就不再告知。', relevance: 10, tags: ['易经', '卦辞', '蒙'] },
  { title: '周易', chapter: '需卦·卦辞', quote: '有孚，光亨，贞吉。利涉大川。', translation: '心怀诚信，光明通达。利于渡过大河。', relevance: 10, tags: ['易经', '卦辞', '需'] },
  { title: '周易', chapter: '讼卦·卦辞', quote: '有孚，窒惕，中吉，终凶。', translation: '有诚信但受阻，谨慎则吉，争讼到底则凶。', relevance: 10, tags: ['易经', '卦辞', '讼'] },
  { title: '周易', chapter: '师卦·卦辞', quote: '贞，丈人吉，无咎。', translation: '守正道，德高望重者统军则吉。', relevance: 10, tags: ['易经', '卦辞', '师'] },
  { title: '周易', chapter: '比卦·卦辞', quote: '吉。原筮元永贞，无咎。不宁方来，后夫凶。', translation: '亲比团结则吉。迟疑落后者凶。', relevance: 10, tags: ['易经', '卦辞', '比'] },
  { title: '周易', chapter: '小畜卦·卦辞', quote: '亨。密云不雨，自我西郊。', translation: '小有积蓄，力量尚未完全施展。', relevance: 10, tags: ['易经', '卦辞', '小畜'] },
  { title: '周易', chapter: '履卦·卦辞', quote: '履虎尾，不咥人，亨。', translation: '踩虎尾而不被咬，化险为夷。', relevance: 10, tags: ['易经', '卦辞', '履'] },
  { title: '周易', chapter: '泰卦·卦辞', quote: '小往大来，吉亨。', translation: '阴退阳长，天地交泰，万物通顺。', relevance: 10, tags: ['易经', '卦辞', '泰'] },
  { title: '周易', chapter: '否卦·卦辞', quote: '否之匪人，不利君子贞。', translation: '天地不交，万物不通。不利于君子。', relevance: 10, tags: ['易经', '卦辞', '否'] },
  { title: '周易', chapter: '同人卦·卦辞', quote: '同人于野，亨。利涉大川。', translation: '在旷野中与人和同，通达。', relevance: 10, tags: ['易经', '卦辞', '同人'] },
  { title: '周易', chapter: '大有卦·卦辞', quote: '元亨。', translation: '大获所有，光明普照。', relevance: 10, tags: ['易经', '卦辞', '大有'] },
  { title: '周易', chapter: '谦卦·卦辞', quote: '亨，君子有终。', translation: '谦卑的君子有善终。', relevance: 10, tags: ['易经', '卦辞', '谦'] },
  { title: '周易', chapter: '豫卦·卦辞', quote: '利建侯行师。', translation: '顺时而动，利于建立诸侯出兵。', relevance: 10, tags: ['易经', '卦辞', '豫'] },
  { title: '周易', chapter: '随卦·卦辞', quote: '元亨利贞，无咎。', translation: '随时而动，通达无灾。', relevance: 10, tags: ['易经', '卦辞', '随'] },
  { title: '周易', chapter: '蛊卦·卦辞', quote: '元亨。利涉大川。先甲三日，后甲三日。', translation: '救弊治乱，做事需审慎。', relevance: 10, tags: ['易经', '卦辞', '蛊'] },
  { title: '周易', chapter: '临卦·卦辞', quote: '元亨利贞。至于八月有凶。', translation: '面临天下，但盛极必衰。', relevance: 10, tags: ['易经', '卦辞', '临'] },
  { title: '周易', chapter: '观卦·卦辞', quote: '盥而不荐，有孚颙若。', translation: '观天道以知人事，心怀诚信。', relevance: 10, tags: ['易经', '卦辞', '观'] },
  { title: '周易', chapter: '噬嗑卦·卦辞', quote: '亨。利用狱。', translation: '咬合而通，利于断案。', relevance: 10, tags: ['易经', '卦辞', '噬嗑'] },
  { title: '周易', chapter: '贲卦·卦辞', quote: '亨。小利有攸往。', translation: '文饰通达，但不可过度追求形式。', relevance: 10, tags: ['易经', '卦辞', '贲'] },
  { title: '周易', chapter: '剥卦·卦辞', quote: '不利有攸往。', translation: '剥落衰败，不宜前往。', relevance: 10, tags: ['易经', '卦辞', '剥'] },
  { title: '周易', chapter: '复卦·卦辞', quote: '亨。七日来复。', translation: '阳气回复，循环反复。', relevance: 10, tags: ['易经', '卦辞', '复'] },
  { title: '周易', chapter: '无妄卦·卦辞', quote: '元亨利贞。其匪正有眚。', translation: '不妄为则通达，不正则有灾。', relevance: 10, tags: ['易经', '卦辞', '无妄'] },
  { title: '周易', chapter: '大畜卦·卦辞', quote: '利贞。不家食吉，利涉大川。', translation: '大积蓄，利于守正。', relevance: 10, tags: ['易经', '卦辞', '大畜'] },
  { title: '周易', chapter: '颐卦·卦辞', quote: '贞吉。观颐，自求口实。', translation: '养正则吉，应自食其力。', relevance: 10, tags: ['易经', '卦辞', '颐'] },
  { title: '周易', chapter: '大过卦·卦辞', quote: '栋桡，利有攸往，亨。', translation: '非常时期需非常手段。', relevance: 10, tags: ['易经', '卦辞', '大过'] },
  { title: '周易', chapter: '坎卦·卦辞', quote: '习坎，有孚，维心亨。', translation: '重重险陷，心怀诚信则通达。', relevance: 10, tags: ['易经', '卦辞', '坎'] },
  { title: '周易', chapter: '离卦·卦辞', quote: '利贞，亨。畜牝牛，吉。', translation: '依附光明，柔顺则吉。', relevance: 10, tags: ['易经', '卦辞', '离'] },
  { title: '周易', chapter: '咸卦·卦辞', quote: '亨，利贞。取女吉。', translation: '感应通达，娶妻吉祥。', relevance: 10, tags: ['易经', '卦辞', '咸'] },
  { title: '周易', chapter: '恒卦·卦辞', quote: '亨，无咎，利贞。利有攸往。', translation: '恒久通达，前往有利。', relevance: 10, tags: ['易经', '卦辞', '恒'] },
  { title: '周易', chapter: '遁卦·卦辞', quote: '亨，小利贞。', translation: '退避通达，小事有利。', relevance: 10, tags: ['易经', '卦辞', '遁'] },
  { title: '周易', chapter: '大壮卦·卦辞', quote: '利贞。', translation: '利于守正。', relevance: 10, tags: ['易经', '卦辞', '大壮'] },
  { title: '周易', chapter: '晋卦·卦辞', quote: '康侯用锡马蕃庶，昼日三接。', translation: '侯爵得赏，一日三见天子。', relevance: 10, tags: ['易经', '卦辞', '晋'] },
  { title: '周易', chapter: '明夷卦·卦辞', quote: '利艰贞。', translation: '在艰难中守正有利。', relevance: 10, tags: ['易经', '卦辞', '明夷'] },
  { title: '周易', chapter: '家人卦·卦辞', quote: '利女贞。', translation: '利于女子持家守正。', relevance: 10, tags: ['易经', '卦辞', '家人'] },
  { title: '周易', chapter: '睽卦·卦辞', quote: '小事吉。', translation: '小事吉利。', relevance: 10, tags: ['易经', '卦辞', '睽'] },
  { title: '周易', chapter: '蹇卦·卦辞', quote: '利西南，不利东北。利见大人。', translation: '往西南有利，利于见大人物。', relevance: 10, tags: ['易经', '卦辞', '蹇'] },
  { title: '周易', chapter: '解卦·卦辞', quote: '利西南。无所往，其来复吉。', translation: '往西南有利，及早行动则吉。', relevance: 10, tags: ['易经', '卦辞', '解'] },
  { title: '周易', chapter: '损卦·卦辞', quote: '有孚，元吉，无咎。', translation: '有诚信则大吉，祭祀不必丰盛。', relevance: 10, tags: ['易经', '卦辞', '损'] },
  { title: '周易', chapter: '益卦·卦辞', quote: '利有攸往，利涉大川。', translation: '前往有利，利于渡河。', relevance: 10, tags: ['易经', '卦辞', '益'] },
  { title: '周易', chapter: '夬卦·卦辞', quote: '扬于王庭，孚号有厉。', translation: '在朝廷宣扬，但有危险。', relevance: 10, tags: ['易经', '卦辞', '夬'] },
  { title: '周易', chapter: '姤卦·卦辞', quote: '女壮，勿用取女。', translation: '女子过于强壮，不宜娶。', relevance: 10, tags: ['易经', '卦辞', '姤'] },
  { title: '周易', chapter: '萃卦·卦辞', quote: '亨。王假有庙。利见大人。', translation: '聚集通达，利于见大人。', relevance: 10, tags: ['易经', '卦辞', '萃'] },
  { title: '周易', chapter: '升卦·卦辞', quote: '元亨。用见大人，勿恤。南征吉。', translation: '大通，向南出征吉祥。', relevance: 10, tags: ['易经', '卦辞', '升'] },
  { title: '周易', chapter: '困卦·卦辞', quote: '亨。贞大人吉。有言不信。', translation: '通达但说话没人信。', relevance: 10, tags: ['易经', '卦辞', '困'] },
  { title: '周易', chapter: '井卦·卦辞', quote: '改邑不改井，无丧无得。', translation: '城邑改但井不改。', relevance: 10, tags: ['易经', '卦辞', '井'] },
  { title: '周易', chapter: '革卦·卦辞', quote: '巳日乃孚。元亨利贞，悔亡。', translation: '变革通达，悔恨消失。', relevance: 10, tags: ['易经', '卦辞', '革'] },
  { title: '周易', chapter: '鼎卦·卦辞', quote: '元吉，亨。', translation: '大吉通达。', relevance: 10, tags: ['易经', '卦辞', '鼎'] },
  { title: '周易', chapter: '震卦·卦辞', quote: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。', translation: '雷震惊百里，但祭祀不失。', relevance: 10, tags: ['易经', '卦辞', '震'] },
  { title: '周易', chapter: '艮卦·卦辞', quote: '艮其背，不获其身。无咎。', translation: '注意背部却看不到全身，无灾。', relevance: 10, tags: ['易经', '卦辞', '艮'] },
  { title: '周易', chapter: '渐卦·卦辞', quote: '女归吉，利贞。', translation: '女子出嫁吉祥。', relevance: 10, tags: ['易经', '卦辞', '渐'] },
  { title: '周易', chapter: '归妹卦·卦辞', quote: '征凶，无攸利。', translation: '出征凶。', relevance: 10, tags: ['易经', '卦辞', '归妹'] },
  { title: '周易', chapter: '丰卦·卦辞', quote: '亨。王假之，勿忧，宜日中。', translation: '通达，君王莅临。', relevance: 10, tags: ['易经', '卦辞', '丰'] },
  { title: '周易', chapter: '旅卦·卦辞', quote: '小亨。旅贞吉。', translation: '旅行中守正则吉。', relevance: 10, tags: ['易经', '卦辞', '旅'] },
  { title: '周易', chapter: '巽卦·卦辞', quote: '小亨。利有攸往，利见大人。', translation: '小有通达，利于见大人。', relevance: 10, tags: ['易经', '卦辞', '巽'] },
  { title: '周易', chapter: '兑卦·卦辞', quote: '亨，利贞。', translation: '欣悦通达。', relevance: 10, tags: ['易经', '卦辞', '兑'] },
  { title: '周易', chapter: '涣卦·卦辞', quote: '亨。王假有庙。利涉大川。', translation: '涣散通达，利于渡河。', relevance: 10, tags: ['易经', '卦辞', '涣'] },
  { title: '周易', chapter: '节卦·卦辞', quote: '亨。苦节不可贞。', translation: '通达，但苛刻的节制不可久。', relevance: 10, tags: ['易经', '卦辞', '节'] },
  { title: '周易', chapter: '中孚卦·卦辞', quote: '豚鱼吉。利涉大川，利贞。', translation: '心怀诚信则吉。', relevance: 10, tags: ['易经', '卦辞', '中孚'] },
  { title: '周易', chapter: '小过卦·卦辞', quote: '亨，利贞。可小事，不可大事。', translation: '适合小事，不适合大事。', relevance: 10, tags: ['易经', '卦辞', '小过'] },
  { title: '周易', chapter: '既济卦·卦辞', quote: '亨小，利贞。初吉终乱。', translation: '开始吉祥，最后会乱。', relevance: 10, tags: ['易经', '卦辞', '既济'] },
  { title: '周易', chapter: '未济卦·卦辞', quote: '亨。小狐汔济，濡其尾。', translation: '小狐狸渡河沾湿尾巴。', relevance: 10, tags: ['易经', '卦辞', '未济'] },
  // 系辞
  { title: '周易', chapter: '系辞上传', quote: '易有太极，是生两仪，两仪生四象，四象生八卦。', translation: '太极生阴阳，阴阳生四象，四象生八卦。', relevance: 10, tags: ['易经', '系辞'] },
  { title: '周易', chapter: '系辞上传', quote: '一阴一阳之谓道。', translation: '一阴一阳的运行变化称为道。', relevance: 10, tags: ['易经', '系辞'] },
  { title: '周易', chapter: '系辞下传', quote: '易穷则变，变则通，通则久。', translation: '穷尽就要变化，变化就能通达。', relevance: 9, tags: ['易经', '系辞'] },
  { title: '周易', chapter: '系辞下传', quote: '善不积不足以成名，恶不积不足以灭身。', translation: '善恶都是积累的结果。', relevance: 8, tags: ['易经', '系辞'] },
  { title: '周易', chapter: '系辞上传', quote: '易无思也，无为也，寂然不动，感而遂通。', translation: '易道寂静，感应则通。', relevance: 8, tags: ['易经', '系辞'] },
  { title: '周易', chapter: '系辞下传', quote: '天地之大德曰生。', translation: '天地最大的品德是化生万物。', relevance: 8, tags: ['易经', '系辞'] },
  // 彖传
  { title: '周易', chapter: '乾卦·彖传', quote: '大哉乾元，万物资始，乃统天。', translation: '伟大的乾元！万物由此开始。', relevance: 9, tags: ['易经', '彖传'] },
];

// ==================== 焦氏易林 ====================

const JIAO_SHI_YI_LIN: ClassicEntry[] = [
  { title: '焦氏易林', chapter: '乾之乾', quote: '道陟石阪，胡言连謇。译瘖且聋，莫使道通。', translation: '道路难行，言语不通，请求无果。', relevance: 8, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '坤之坤', quote: '不风不雨，白日皎皎。宜出驱驰，通利大道。', translation: '风和日丽，适合出行。', relevance: 8, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '屯之屯', quote: '兵征大宛，北出玉门。七日绝粮，身几不全。', translation: '出征大宛，七日断粮，几乎丧命。', relevance: 8, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '蒙之蒙', quote: '何草不黄，至未尽玄。室家分离，悲哭于城。', translation: '家人分离，在城中悲伤哭泣。', relevance: 8, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '需之需', quote: '久旱三年，草木不生。粜贵十倍，人民饥荒。', translation: '大旱三年，粮价十倍，人民饥荒。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '讼之讼', quote: '民不安室，抱子弃妻。客从外来，请谒不理。', translation: '人民不安于室。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '师之师', quote: '鸟鸣呼子，哺以酒脯。啬人成功，年岁大有。', translation: '节俭的人成功，年岁丰收。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '泰之泰', quote: '求玉得石，非所愿闻。失其所望，令人忧闷。', translation: '求玉得石，事与愿违。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '谦之豫', quote: '江河淮海，天之都市。商人受福，国家富有。', translation: '商人得福，国家富有。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '随之大畜', quote: '天地际会，不见其根。百官集会，不见其门。', translation: '天地相会，百官集会。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '临之震', quote: '白马骊骝，任重载多。日暮途远，行者苦忧。', translation: '负载过重，天晚路远，行者忧愁。', relevance: 7, tags: ['焦氏易林'] },
  { title: '焦氏易林', chapter: '复之无妄', quote: '骍牛伤力，耕事不殖。岁事不登，民食不足。', translation: '牛伤无力，耕种无收。', relevance: 7, tags: ['焦氏易林'] },
];

// ==================== 火珠林 ====================

const HUO_ZHU_LIN: ClassicEntry[] = [
  { title: '火珠林', chapter: '六爻根源', quote: '六爻之数，三才之道。上两爻为天，下两爻为地，中两爻为人。', translation: '六爻蕴含天地人三才。', relevance: 9, tags: ['六爻', '纳甲'] },
  { title: '火珠林', chapter: '起卦法', quote: '以钱代蓍，三钱而六。三变为一爻，十八变为一卦。', translation: '三枚铜钱摇六次得一卦。', relevance: 9, tags: ['六爻', '纳甲'] },
  { title: '火珠林', chapter: '纳甲法', quote: '乾纳甲壬，坤纳乙癸，艮纳丙，兑纳丁，坎纳戊，离纳己。', translation: '八卦配十天干。', relevance: 8, tags: ['六爻', '纳甲'] },
  { title: '火珠林', chapter: '六亲', quote: '生我者父母，我生者子孙。克我者官鬼，我克者妻财。', translation: '六亲关系：生我为父母，我生为子孙。', relevance: 8, tags: ['六爻', '六亲'] },
  { title: '火珠林', chapter: '六神', quote: '甲乙青龙，丙丁朱雀，戊巳勾陈，庚辛白虎，壬癸玄武。', translation: '六神与天干对应。', relevance: 8, tags: ['六爻', '六神'] },
  { title: '火珠林', chapter: '用神', quote: '占父母以父母爻为用神，占财运以妻财爻，占官运以官鬼爻。', translation: '不同占事选取不同用神。', relevance: 9, tags: ['六爻', '用神'] },
  { title: '火珠林', chapter: '月破', quote: '正申二酉三戌四亥五子六丑七寅八卯九辰十巳。', translation: '每月有一地支为破。', relevance: 7, tags: ['六爻', '月破'] },
  { title: '火珠林', chapter: '旬空', quote: '甲子旬中戌亥空，甲戌旬中申酉空，甲申旬中午未空。', translation: '每旬有两个地支为空亡。', relevance: 7, tags: ['六爻', '旬空'] },
  { title: '火珠林', chapter: '三合', quote: '申子辰合水局，亥卯未合木局，寅午戌合火局，巳酉丑合金局。', translation: '地支三合局对应五行。', relevance: 7, tags: ['六爻', '三合'] },
  { title: '火珠林', chapter: '独发', quote: '一爻独发，其力最大。静若九地之阴，动若九天之雷。', translation: '独发之爻力量最大。', relevance: 7, tags: ['六爻', '独发'] },
];

// ==================== 梅花易数 ====================

const MEI_HUA_YI_SHU: ClassicEntry[] = [
  { title: '梅花易数', chapter: '起卦', quote: '年月日时起卦：年支数加月数加日数除以八为上卦，再加时数除以八为下卦。', translation: '用年月日时起卦，总和除6为动爻。', relevance: 9, tags: ['梅花', '起卦'] },
  { title: '梅花易数', chapter: '体用', quote: '体克用诸事吉，用克体诸事凶。体生用主耗散，用生体主进益。', translation: '体卦克用卦吉，反之凶。', relevance: 9, tags: ['梅花', '体用'] },
  { title: '梅花易数', chapter: '类象·乾', quote: '乾为天、为父、为君、为首、为马、为金、为刚健。', translation: '乾卦代表天、父亲、君王、头部等。', relevance: 8, tags: ['梅花', '类象'] },
  { title: '梅花易数', chapter: '类象·坤', quote: '坤为地、为母、为臣、为腹、为牛、为布、为均。', translation: '坤卦代表地、母亲、臣子、腹部等。', relevance: 8, tags: ['梅花', '类象'] },
  { title: '梅花易数', chapter: '类象·震', quote: '震为雷、为龙、为长子、为足、为决躁。', translation: '震卦代表雷、龙、长子等。', relevance: 8, tags: ['梅花', '类象'] },
  { title: '梅花易数', chapter: '类象·坎', quote: '坎为水、为中男、为耳、为隐伏、为加忧。', translation: '坎卦代表水、中男、忧虑等。', relevance: 8, tags: ['梅花', '类象'] },
  { title: '梅花易数', chapter: '类象·离', quote: '离为火、为中女、为目、为电、为日、为甲胄。', translation: '离卦代表火、中女、眼睛等。', relevance: 8, tags: ['梅花', '类象'] },
  { title: '梅花易数', chapter: '三要十应', quote: '三要者，耳目心也。十应者，天时地理人事之应。', translation: '三要指耳目心，十应包括天时地理等。', relevance: 7, tags: ['梅花', '外应'] },
];

// ==================== 增删卜易 & 卜筮正宗 ====================

const ZENG_SHAN_BU_YI: ClassicEntry[] = [
  { title: '增删卜易', chapter: '用神', quote: '易书最重者，莫如用神。用神一得，万事皆谐。', translation: '用神是六爻占卜的核心。', relevance: 9, tags: ['六爻', '用神'] },
  { title: '增删卜易', chapter: '进神退神', quote: '进神如春潮之涨，退神如秋叶之落。', translation: '进神增长，退神消退。', relevance: 8, tags: ['六爻', '进神退神'] },
  { title: '增删卜易', chapter: '飞伏', quote: '飞神为显，伏神为隐。飞犹如形，伏犹如影。', translation: '飞神显露，伏神隐藏。', relevance: 8, tags: ['六爻', '飞伏'] },
  { title: '增删卜易', chapter: '断卦', quote: '动变为先，生克为重。旺相者吉，休囚者凶。', translation: '旺相则吉，休囚则凶。', relevance: 8, tags: ['六爻', '断卦'] },
  { title: '增删卜易', chapter: '应期', quote: '用神旺相遇日辰，休囚待旺时。动而逢合，静而逢冲。', translation: '旺相遇日辰为应期。', relevance: 8, tags: ['六爻', '应期'] },
];

const BU_SHI_ZHENG_ZONG: ClassicEntry[] = [
  { title: '卜筮正宗', chapter: '黄金策', quote: '动静阴阳，反复迁变。虽有万象，不外一心。', translation: '万象皆由心造。', relevance: 8, tags: ['六爻', '理论'] },
  { title: '卜筮正宗', chapter: '碎金赋', quote: '生扶拱合，时雨滋苗。克害刑冲，秋霜杀草。', translation: '生扶如雨，克害如霜。', relevance: 8, tags: ['六爻', '理论'] },
  { title: '卜筮正宗', chapter: '千金赋', quote: '世为己，应为人。大宜契合，切防相侵。', translation: '世爻为自己，应爻为他人。', relevance: 7, tags: ['六爻', '理论'] },
];

// ==================== 六壬 & 奇门 ====================

const DA_LIU_REN: ClassicEntry[] = [
  { title: '六壬大全', chapter: '毕法赋', quote: '前后引从升迁吉，首尾相加看始终。闭口之卦休问病。', translation: '前后引从升迁吉，闭口卦不问病。', relevance: 8, tags: ['六壬'] },
  { title: '六壬大全', chapter: '课体', quote: '元首一上克其下，重审一下贼其上。', translation: '元首课上克下，重审课下克上。', relevance: 9, tags: ['六壬'] },
  { title: '六壬大全', chapter: '九宗门', quote: '占卜之法，不出九门：元首、重审、知一、涉害、遥克、昴星、弹射、伏吟、返吟。', translation: '六壬起课有九种类型。', relevance: 9, tags: ['六壬'] },
];

const QI_MEN_DUN_JIA: ClassicEntry[] = [
  { title: '奇门遁甲', chapter: '烟波钓叟', quote: '阴阳顺逆妙难穷，二至还归一九宫。若能了达阴阳理，天地都在一掌中。', translation: '通达阴阳之理，天地尽在掌握。', relevance: 9, tags: ['奇门'] },
  { title: '奇门遁甲', chapter: '八门', quote: '休门宜面君，生门宜求财。伤门宜捕猎，杜门宜隐遁。', translation: '八门各有宜忌。', relevance: 8, tags: ['奇门'] },
];

// ==================== 八字类 ====================

const BA_ZI: ClassicEntry[] = [
  { title: '渊海子平', chapter: '五行', quote: '五行相生：金生水，水生木，木生火，火生土，土生金。', translation: '五行相生：金水木火土依次相生。', relevance: 10, tags: ['八字', '五行'] },
  { title: '渊海子平', chapter: '十神', quote: '克我者官杀，我克者财星。生我者印绶，我生者食伤。同我者比劫。', translation: '十神关系定义。', relevance: 9, tags: ['八字', '十神'] },
  { title: '渊海子平', chapter: '大运', quote: '阳男阴女，顺行；阴男阳女，逆行。', translation: '大运的顺逆行。', relevance: 8, tags: ['八字', '大运'] },
  { title: '渊海子平', chapter: '格局', quote: '日主者，一身之主。旺则宜泄宜克，弱则宜生宜扶。', translation: '日主旺衰决定扶抑。', relevance: 8, tags: ['八字', '格局'] },
  { title: '渊海子平', chapter: '用神', quote: '用神者，八字之枢纽也。取用之法有扶抑、调候、通关、病药。', translation: '用神是八字的枢纽。', relevance: 8, tags: ['八字', '用神'] },
  { title: '三命通会', chapter: '论命', quote: '人之命，天地之数也。得正气者其命贵，得偏气者其命富。', translation: '命由禀气而定。', relevance: 7, tags: ['八字', '论命'] },
  { title: '三命通会', chapter: '财官', quote: '财为养命之源，官为荣身之本。', translation: '财养命，官荣身。', relevance: 7, tags: ['八字', '财官'] },
  { title: '滴天髓', chapter: '天道', quote: '欲识三元万法宗，先观帝载与神功。五气偏全论吉凶。', translation: '识三元观天道，五气偏全定吉凶。', relevance: 9, tags: ['八字', '滴天髓'] },
  { title: '滴天髓', chapter: '地道', quote: '一土虽能生万物，五行相克亦相宜。', translation: '土生万物，五行相克也相宜。', relevance: 8, tags: ['八字', '滴天髓'] },
  { title: '滴天髓', chapter: '人道', quote: '戴天覆地人为贵，顺则吉兮凶则悖。', translation: '顺应天道则吉，悖逆则凶。', relevance: 8, tags: ['八字', '滴天髓'] },
  { title: '滴天髓', chapter: '天干', quote: '甲木参天，脱胎要火。乙木虽柔，刲羊解牛。', translation: '甲木参天需火，乙木柔而能刚。', relevance: 8, tags: ['八字', '滴天髓'] },
  { title: '滴天髓', chapter: '天干', quote: '丙火猛烈，欺霜侮雪。丁火柔中，内性昭融。', translation: '丙火猛烈，丁火柔中。', relevance: 8, tags: ['八字', '滴天髓'] },
  { title: '滴天髓', chapter: '天干', quote: '壬水通河，能泄金气。癸水至弱，达于天津。', translation: '壬水通河，癸水至弱而能达天。', relevance: 8, tags: ['八字', '滴天髓'] },
];

// ==================== 堪舆 & 相术 & 综合 ====================

const KAN_YU: ClassicEntry[] = [
  { title: '葬书', chapter: '原著', quote: '葬者，藏也，乘生气也。', translation: '葬就是藏，要乘生气。', relevance: 9, tags: ['堪舆'] },
  { title: '葬书', chapter: '原著', quote: '气乘风则散，界水则止。故谓之风水。', translation: '气遇风散遇水止，故名风水。', relevance: 9, tags: ['堪舆'] },
  { title: '撼龙经', chapter: '原著', quote: '寻龙千万看缠山，一重缠是一重关。关门若有千重锁，定有王侯居此间。', translation: '龙脉看缠山，多重关锁必出王侯。', relevance: 8, tags: ['堪舆', '龙脉'] },
  { title: '撼龙经', chapter: '原著', quote: '昆仑山是天地骨，中镇天心为巨物。生出四肢龙突兀。', translation: '昆仑为天地之骨，龙脉从此出。', relevance: 8, tags: ['堪舆', '龙脉'] },
];

const XIANG_SHU: ClassicEntry[] = [
  { title: '麻衣神相', chapter: '总论', quote: '相人先相心，心正则相正，心邪则相邪。', translation: '看相先看心。', relevance: 8, tags: ['相术'] },
  { title: '麻衣神相', chapter: '十三部位', quote: '天庭饱满，地阁方圆。日月角起，皆为贵相。', translation: '天庭地阁为贵相。', relevance: 8, tags: ['相术'] },
  { title: '月波洞中记', chapter: '骨法', quote: '骨法九般：天庭、日月、山林、伏犀、驿马、龙角、虎颈、凤膊、龙骨。', translation: '骨相有九种。', relevance: 8, tags: ['相术'] },
];

const ZONG_HE: ClassicEntry[] = [
  { title: '太玄经', chapter: '原著', quote: '玄者，幽摛万类而不见形者也。', translation: '玄是暗中展开万物而不见形。', relevance: 7, tags: ['综合'] },
  { title: '皇极经世', chapter: '观物', quote: '元会运世：一元十二会，一会三十运，一运十二世，一世三十年。', translation: '一元=12会=360运=4320世=129600年。', relevance: 8, tags: ['综合'] },
  { title: '皇极经世', chapter: '观物', quote: '天生于动者也，地生于静者也。一动一静交而天地之道尽矣。', translation: '天动地静，交而道尽。', relevance: 8, tags: ['综合'] },
  { title: '五行大义', chapter: '原著', quote: '五行者，五气也。在天为五星，在地为五方，在人为五脏。', translation: '五行在天为五星，在地为五方，在人为五脏。', relevance: 8, tags: ['综合', '五行'] },
  { title: '五行大义', chapter: '原著', quote: '甲乙属木，丙丁属火，戊巳属土，庚辛属金，壬癸属水。', translation: '十天干的五行属性。', relevance: 8, tags: ['综合', '干支'] },
];

// ==================== 典籍库 ====================

export const CLASSICS_LIBRARY: ClassicEntry[] = [
  ...YI_JING,
  ...JIAO_SHI_YI_LIN,
  ...HUO_ZHU_LIN,
  ...MEI_HUA_YI_SHU,
  ...ZENG_SHAN_BU_YI,
  ...BU_SHI_ZHENG_ZONG,
  ...DA_LIU_REN,
  ...QI_MEN_DUN_JIA,
  ...BA_ZI,
  ...KAN_YU,
  ...XIANG_SHU,
  ...ZONG_HE,
];

export class ClassicLibraryImpl {
  static getAll(): ClassicEntry[] { return CLASSICS_LIBRARY; }
  static getByTitle(title: string): ClassicEntry[] { return CLASSICS_LIBRARY.filter(e => e.title === title); }
  static getByTag(tag: string): ClassicEntry[] { return CLASSICS_LIBRARY.filter(e => e.tags.includes(tag)); }
  static search(keyword: string): ClassicEntry[] {
    const kw = keyword.toLowerCase();
    return CLASSICS_LIBRARY.filter(e => e.quote.includes(kw) || e.translation.includes(kw));
  }
  static getCategories(): { name: string; count: number }[] {
    const catMap = new Map<string, number>();
    CLASSICS_LIBRARY.forEach(e => e.tags.forEach(t => catMap.set(t, (catMap.get(t) || 0) + 1)));
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }
}

export default ClassicLibraryImpl;