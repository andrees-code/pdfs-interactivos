<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      
      <div class="auth-header">
        <div class="auth-logo-wrapper">
          <i class="ph ph-planet"></i>
        </div>
        <h2>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>
        <p class="subtitle">{{ isLogin ? 'Bienvenido de nuevo a tu espacio de trabajo' : 'Únete y empieza a crear presentaciones' }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div v-if="!isLogin" class="prop-group">
          <label>Nombre de usuario</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="pro-input" 
            placeholder="ej. design_master" 
            required 
          />
        </div>
        
        <div class="prop-group">
          <label>Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            class="pro-input" 
            placeholder="tu@correo.com" 
            required 
          />
        </div>
        
        <div class="prop-group">
          <label>Contraseña</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="pro-input" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" class="btn-primary mt-4 w-100 large-btn">
          <i class="ph" :class="isLogin ? 'ph-sign-in' : 'ph-user-plus'"></i>
          {{ isLogin ? 'Entrar al Editor' : 'Registrarse' }}
        </button>
      </form>

      <div @click="isLogin = !isLogin" class="toggle-mode">
        {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
      </div>

      <div v-if="errorMessage" class="error-box">
        <i class="ph ph-warning-circle"></i> {{ errorMessage }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service'; 
import { useAuthStore } from '@/stores/auth'; 

const isLogin = ref(true);
const errorMessage = ref('');

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    errorMessage.value = '';
    
    if (isLogin.value) {
      const result = await authService.login({
        email: form.value.email,
        password: form.value.password
      });
      
      console.log('Login exitoso:', result);
      authStore.login(result.token, result.user); 
      router.push('/'); 
      
    } else {
      const result = await authService.register(form.value);
      console.log('Registro exitoso:', result);
      
      isLogin.value = true; 
      form.value.password = ''; 
      alert('Registro exitoso. Por favor, inicia sesión.');
    }
  } catch (error) {
    errorMessage.value = error.message;
  }
};
</script>

<style scoped>
/* ENVOLTURA - SIN SCROLL */
.auth-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  /* dvh toma en cuenta la barra de navegación en móviles */
  height: 100dvh; 
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0d1117;
  background-image: radial-gradient(#30363d 1px, transparent 1px);
  background-size: 20px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 15px;
  box-sizing: border-box;
  overflow: hidden; /* Previene explícitamente el scroll */
}

/* TARJETA PRINCIPAL DINÁMICA */
.auth-card {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  /* El padding se encoge en pantallas bajitas */
  padding: clamp(20px, 4dvh, 40px) clamp(20px, 5vw, 30px);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* ENCABEZADO */
.auth-header {
  text-align: center;
  margin-bottom: clamp(15px, 3dvh, 30px);
}

.auth-logo-wrapper {
  /* Se hace más pequeño en pantallas cortas */
  width: clamp(40px, 8dvh, 50px);
  height: clamp(40px, 8dvh, 50px);
  background: rgba(88, 166, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(10px, 2dvh, 15px) auto;
  border: 1px solid rgba(88, 166, 255, 0.2);
}

.auth-logo-wrapper i {
  font-size: clamp(1.4rem, 4dvh, 1.8rem);
  color: #58a6ff;
}

.auth-header h2 {
  margin: 0 0 6px 0;
  color: #c9d1d9;
  font-size: clamp(1.2rem, 3dvh, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  color: #8b949e;
  font-size: clamp(0.8rem, 2dvh, 0.9rem);
}

/* GRUPOS DE FORMULARIO */
.prop-group {
  margin-bottom: clamp(12px, 2.5dvh, 20px);
  text-align: left;
}

.prop-group label {
  display: block;
  font-size: 0.75rem;
  color: #8b949e;
  margin-bottom: clamp(4px, 1dvh, 8px);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* INPUTS */
.pro-input {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  /* Reducimos el padding interno si falta espacio vertical */
  padding: clamp(10px, 2dvh, 12px) 14px;
  border-radius: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: clamp(0.85rem, 2dvh, 0.95rem);
  transition: all 0.2s ease;
}

.pro-input::placeholder {
  color: #484f58;
}

.pro-input:focus {
  outline: none;
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
}

/* BOTONES */
.btn-primary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: clamp(10px, 2dvh, 12px) 24px;
  border-radius: 8px;
  font-size: clamp(0.9rem, 2dvh, 1rem);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(240, 246, 252, 0.1);
  box-sizing: border-box;
  transition: all 0.2s;
  background: #238636;
  color: #fff;
}

.btn-primary:hover {
  background: #2ea043;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 160, 67, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.w-100 {
  width: 100%;
}

.mt-4 {
  margin-top: clamp(15px, 3dvh, 25px);
}

/* ENLACE PARA CAMBIAR DE MODO */
.toggle-mode {
  color: #58a6ff;
  cursor: pointer;
  margin-top: clamp(15px, 3dvh, 25px);
  font-size: clamp(0.8rem, 2dvh, 0.85rem);
  text-align: center;
  transition: color 0.2s;
  font-weight: 500;
}

.toggle-mode:hover {
  color: #79c0ff;
  text-decoration: underline;
}

/* CAJA DE ERROR */
.error-box {
  margin-top: clamp(10px, 2dvh, 20px);
  background: rgba(218, 54, 51, 0.1);
  border-left: 3px solid #ff7b72;
  padding: clamp(8px, 1.5dvh, 12px) 15px;
  border-radius: 6px;
  color: #ff7b72;
  font-size: clamp(0.75rem, 2dvh, 0.85rem);
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  line-height: 1.4;
}

.error-box i {
  font-size: clamp(1rem, 2.5dvh, 1.2rem);
}
</style>