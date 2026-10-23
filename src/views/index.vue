<template>
  <section class="hero">
    <div class="hero__card">
      <div class="hero__tag">English Training System</div>

      <h1 class="hero__title">把英文練到「可用」</h1>

      <p class="hero__desc">用單字題庫累積輸入，用測驗把輸出練成直覺。每天 15 分鐘，穩定變強。</p>

      <div class="hero__actions">
        <el-button type="primary" @click="go('/b0200')">開始測驗</el-button>
        <el-button plain @click="go('/b0100')">去題庫新增單字</el-button>
        <el-button @click="go('/b0300')">錯題本</el-button>
      </div>

      <div class="hero__stats">
        <div class="stat">
          <div class="stat__k">Focus</div>
          <div class="stat__v">Vocabulary + Quiz</div>
        </div>
        <div class="stat">
          <div class="stat__k">Mode</div>
          <div class="stat__v">Fast • Clean • Minimal</div>
        </div>
        <div class="stat">
          <div class="stat__k">Goal</div>
          <div class="stat__v">TOEIC 750+</div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="entry" @click="go('/b0100')" role="button" tabindex="0">
        <div class="entry__head">
          <div class="entry__title">單字題庫</div>
        </div>
        <div class="entry__body">匯入 Excel、快速搜尋、標記已記住，打造你的個人字庫。</div>
        <div class="entry__foot">
          <span class="entry__hint">進入</span>
          <span class="entry__arrow">→</span>
        </div>
      </div>

      <div class="entry" @click="go('/b0200')" role="button" tabindex="0">
        <div class="entry__head">
          <div class="entry__title">英文測驗</div>
        </div>
        <div class="entry__body">英↔中抽考、錯題回顧、節奏練習，把記憶變成反射。</div>
        <div class="entry__foot">
          <span class="entry__hint">進入</span>
          <span class="entry__arrow">→</span>
        </div>
      </div>

      <div class="entry" @click="go('/b0300')" role="button" tabindex="0">
        <div class="entry__head">
          <div class="entry__title">錯題本</div>
        </div>
        <div class="entry__body">蒐集錯誤單字、掌握弱點，讓每次犯錯都變成進步。</div>
        <div class="entry__foot">
          <span class="entry__hint">進入</span>
          <span class="entry__arrow">→</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeView' })

import { useRouter } from 'vue-router'
const router = useRouter()

function go(path: string) {
  router.push(path)
}
</script>

<style scoped>
.hero {
  display: grid;
  gap: 16px;
}

.hero__card {
  border-radius: 22px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.hero__tag {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.hero__title {
  margin: 10px 0 6px;
  font-size: 34px;
  letter-spacing: 0.2px;
}

.hero__desc {
  margin: 0;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.65;
}

.hero__actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero__stats {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 720px) {
  .hero__stats {
    grid-template-columns: 1fr;
  }
}

.stat {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.stat__k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
}
.stat__v {
  margin-top: 4px;
  font-weight: 600;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.entry {
  cursor: pointer;
  border-radius: 18px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}
.entry:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.entry__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.entry__badge {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.28);
}
.entry__title {
  font-weight: 700;
  letter-spacing: 0.2px;
}

.entry__body {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.66);
  line-height: 1.65;
}

.entry__foot {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.76);
}
.entry__arrow {
  font-weight: 800;
}
</style>
