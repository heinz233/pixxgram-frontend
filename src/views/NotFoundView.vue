<template>
  <v-container fluid class="fill-height" style="background: rgb(var(--v-theme-background))">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <p class="text-h1 font-weight-black" style="color: rgba(0,0,0,0.06); font-size: 8rem;">404</p>
        <h2 class="text-h5 font-weight-bold mt-n4 mb-3">Page not found</h2>
        <p class="text-medium-emphasis mb-6">The page you're looking for doesn't exist.</p>
        <v-btn color="primary" :to="{ name: 'Home' }">Go Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
