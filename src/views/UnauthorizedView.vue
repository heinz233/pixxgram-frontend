<template>
  <v-container fluid class="fill-height" style="background: rgb(var(--v-theme-background))">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-icon size="72" color="error" class="mb-4">mdi-lock-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-3">Access Denied</h2>
        <p class="text-medium-emphasis mb-6">You don't have permission to view this page.</p>
        <v-btn color="primary" @click="$router.back()">Go Back</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
