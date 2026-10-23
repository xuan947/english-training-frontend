<template>
  <div class="layout">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand" @click="goHome">
          <div class="logo">
            <span class="logo__dot"></span>
            <span class="logo__dot logo__dot--soft"></span>
          </div>
          <div>
            <div class="brand__title">English Training</div>
            <div class="brand__subtitle">Vocabulary • Quiz • Progress</div>
          </div>
        </div>

        <div class="topbar__right">
          <el-tag class="status__tag" effect="dark" round>Beta</el-tag>
          <el-button text @click="openHelp">Help</el-button>
        </div>
      </div>
    </header>

    <!-- Nav -->
    <nav class="nav">
      <div class="nav__inner">
        <router-link class="nav__item" to="/b0100" :class="{ active: isActive('/b0100') }">
          單字題庫
        </router-link>

        <router-link class="nav__item" to="/b0200" :class="{ active: isActive('/b0200') }">
          英文測驗
        </router-link>

        <router-link class="nav__item" to="/b0300" :class="{ active: isActive('/b0300') }">
          錯題本
        </router-link>
        
        <router-link class="nav__item" to="/b0400" :class="{ active: isActive('/b0400') }">
          錯題庫 / 抽考
        </router-link>
        <div class="nav__spacer"></div>

        <el-button type="primary" @click="quickStart">Quick Start</el-button>
      </div>
    </nav>

    <!-- Main -->
    <main class="app-shell">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const goHome = () => router.push('/')
const quickStart = () => router.push('/b0200')
const isActive = (p: string) => route.path.startsWith(p)

const openHelp = async () => {
  await ElMessageBox.alert('建議每天 15 分鐘：題庫 5 分鐘 + 測驗 10 分鐘', 'Help')
}
</script>

<style></style>
