<template>
  <div class="auth-wrapper anim-fade-in">
    <div class="auth-card glass-panel anim-slide-up">
      
      <div class="auth-header">
        <div class="auth-logo-wrapper">
          <i class="ph ph-planet text-gradient"></i>
        </div>
        <h2 class="text-gradient">{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>
        <p class="subtitle">{{ isLogin ? 'Bienvenido de nuevo a tu espacio' : 'Empieza a crear presentaciones' }}</p>
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

      <div v-if="errorMessage" class="error-box anim-pop-in">
        <i class="ph ph-warning-circle"></i> {{ errorMessage }}
      </div>

      <!-- Partículas decorativas de fondo -->
      <div class="ambient-glow bg-blob-1"></div>
      <div class="ambient-glow bg-blob-2"></div>
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
  height: 100dvh; 
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-base);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 40%);
  padding: 15px;
  box-sizing: border-box;
  overflow: hidden;
}

/* TARJETA PRINCIPAL DINÁMICA */
.auth-card {
  position: relative;
  z-index: 10;
  padding: clamp(30px, 5dvh, 50px) clamp(24px, 5vw, 40px);
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

/* ENCABEZADO */
.auth-header {
  text-align: center;
  margin-bottom: clamp(20px, 4dvh, 35px);
  position: relative;
  z-index: 2;
}

.auth-logo-wrapper {
  width: clamp(48px, 8dvh, 60px);
  height: clamp(48px, 8dvh, 60px);
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(15px, 2.5dvh, 20px) auto;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.1);
}

.auth-logo-wrapper i {
  font-size: clamp(1.8rem, 4dvh, 2.2rem);
}

.auth-header h2 {
  margin: 0 0 8px 0;
  font-size: clamp(1.4rem, 3.5dvh, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(0.85rem, 2dvh, 0.95rem);
  line-height: 1.5;
}

/* GRUPOS DE FORMULARIO */
.prop-group {
  margin-bottom: clamp(14px, 2.5dvh, 22px);
  text-align: left;
  position: relative;
  z-index: 2;
}

.prop-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: clamp(6px, 1dvh, 8px);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* INPUTS */
.pro-input {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  padding: clamp(12px, 2dvh, 14px) 16px;
  border-radius: var(--radius-md);
  box-sizing: border-box;
  font-family: var(--font-main);
  font-size: clamp(0.9rem, 2dvh, 1rem);
  transition: all var(--transition-fast);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.pro-input::placeholder {
  color: var(--text-tertiary);
}

.pro-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(0,0,0,0.1);
  background: rgba(17, 17, 19, 0.8);
}

/* BOTONES */
.btn-primary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: clamp(12px, 2dvh, 15px) 24px;
  border-radius: var(--radius-md);
  font-size: clamp(0.95rem, 2dvh, 1.05rem);
  font-weight: 600;
  cursor: pointer;
  border: none;
  box-sizing: border-box;
  transition: all var(--transition-normal);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover::after {
  opacity: 1;
}

.btn-primary:active {
  transform: translateY(0);
}

.w-100 {
  width: 100%;
}

.mt-4 {
  margin-top: clamp(20px, 3dvh, 30px);
}

/* ENLACE PARA CAMBIAR DE MODO */
.toggle-mode {
  color: var(--text-secondary);
  cursor: pointer;
  margin-top: clamp(15px, 3dvh, 25px);
  font-size: clamp(0.85rem, 2dvh, 0.9rem);
  text-align: center;
  transition: color var(--transition-fast);
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.toggle-mode:hover {
  color: var(--text-primary);
  text-decoration: underline;
}

/* CAJA DE ERROR */
.error-box {
  margin-top: clamp(15px, 2dvh, 25px);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 3px solid var(--danger);
  padding: clamp(10px, 1.5dvh, 14px) 16px;
  border-radius: var(--radius-md);
  color: #fca5a5;
  font-size: clamp(0.8rem, 2dvh, 0.9rem);
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  line-height: 1.4;
  position: relative;
  z-index: 2;
}

.error-box i {
  font-size: clamp(1.1rem, 2.5dvh, 1.3rem);
  color: var(--danger);
}

/* AMBIENT GLOWS */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  z-index: 0;
  opacity: 0.15;
  pointer-events: none;
}

.bg-blob-1 {
  width: 250px;
  height: 250px;
  background: var(--accent-primary);
  top: -100px;
  left: -50px;
}

.bg-blob-2 {
  width: 200px;
  height: 200px;
  background: var(--accent-secondary);
  bottom: -80px;
  right: -50px;
}
</style>