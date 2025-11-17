# Resumen de cambios, bugs y decisiones recientes (para changelog/commit)

#### Cambios, procesos y soluciones recientes

- Se resolvió el problema de pantalla en blanco (index.html no ejecutaba) asegurando la correcta copia de assets Angular a `www/` y `platforms/android/app/src/main/assets/www`.
- Se documentó y solucionó el error de compilación `error:0308010C:digital envelope routines::unsupported` usando Node.js 16 o la variable `NODE_OPTIONS=--openssl-legacy-provider`.
- Se corrigió el crash al iniciar la app eliminando el atributo inválido `android:name` en `<application>` del `AndroidManifest.xml`.
- Se documentó el proceso de build, instalación y depuración con comandos claros (`cordova build`, `adb install`, `adb shell monkey`, `adb logcat`).
- Se establecieron versiones y configuraciones recomendadas para Node.js, Java JDK y variables de entorno, priorizando compatibilidad y estabilidad.
- Se actualizó el README con todas las soluciones, comandos y buenas prácticas para facilitar el onboarding y la resolución de problemas futuros.

**Motivos de cada decisión:**
- Node.js 16 es la versión más estable para Angular 9 y Cordova.
- El atributo `android:name` solo debe usarse con una clase Application válida, nunca con valores de plugins.
- Documentar los comandos y problemas comunes acelera la depuración y el soporte a otros desarrolladores.

---
# Historial de problemas, bugs y soluciones

### 1. La app no ejecutaba index.html (pantalla en blanco)
- **Síntoma:** Al abrir la app, solo se veía una pantalla en blanco o no cargaba el contenido web.
- **Causa:** Los assets de Angular no se copiaban correctamente a la carpeta `www/` o a `platforms/android/app/src/main/assets/www`.
- **Solución:**
  1. Ejecutar `npm run build -- --prod` para generar los archivos en `www/`.
  2. Ejecutar `npx cordova prepare android` para sincronizar los assets con la plataforma Android.
  3. Verificar que el archivo `index.html` exista en `platforms/android/app/src/main/assets/www`.

### 2. Error de compilación: error:0308010C:digital envelope routines::unsupported
- **Síntoma:** Al compilar, aparecía el error:
  ```
  Error: error:0308010C:digital envelope routines::unsupported
  ```
- **Causa:** Angular/Webpack no es compatible con Node.js 17+ sin una variable especial.
- **Solución:**
  - Usar Node.js 16 (recomendado):
    ```sh
    nvm install 16
    nvm use 16
    ```
  - O bien, exportar la variable antes de compilar:
    ```sh
    export NODE_OPTIONS=--openssl-legacy-provider
    npm run build -- --prod
    ```

### 3. Crash al iniciar la app por android:name inválido en AndroidManifest.xml
- **Síntoma:** La app se cerraba inmediatamente al abrirse.
- **Causa:** El archivo `AndroidManifest.xml` tenía el atributo `android:name="onesignal_google_project_number"` en `<application>`, lo cual es inválido. Este atributo solo debe usarse si se define una clase personalizada de Application.
- **Solución:**
  - Eliminar el atributo `android:name` de `<application>`. El valor de OneSignal debe ir solo como `<meta-data>`.
  - Comandos usados para solucionar:
    ```sh
    npx cordova build android
    adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
    adb shell monkey -p com.sysmard.yochivoy.repartidor -c android.intent.category.LAUNCHER 1
    ```
  - Si persiste el problema, revisar logs en tiempo real:
    ```sh
    ID=$(adb shell pidof com.sysmard.yochivoy.repartidor)
    if [ -n "$ID" ]; then
      adb logcat --pid=$ID | egrep -i 'FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
    else
      adb logcat | egrep -i 'com.sysmard.yochivoy.repartidor|FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
    fi
    ```

### 4. Problemas de entorno y configuración
- **Síntoma:** Errores de compilación relacionados con Java o Android SDK.
- **Causa:** Variables de entorno `JAVA_HOME` o `ANDROID_HOME` mal configuradas, o versiones incompatibles.

### 5. Error iOS: 'OneSignalFramework/OneSignalFramework.h' file not found y problemas con CocoaPods
- **Síntoma:** Al compilar para iOS, aparece el error:
  ```
  'OneSignalFramework/OneSignalFramework.h' file not found
  ```
  o bien:
  ```
  The sandbox is not in sync with the Podfile.lock. Run 'pod install' or update your CocoaPods installation.
  ```
- **Causa:** Las dependencias de CocoaPods no están instaladas o actualizadas, o se está abriendo el proyecto con el archivo `.xcodeproj` en vez de `.xcworkspace`.
- **Solución:**
  1. Abre una terminal y navega a la carpeta de iOS:
    ```sh
    cd platforms/ios
    ```
  2. Instala o actualiza las dependencias de CocoaPods:
    ```sh
    pod install
    ```
    Si ves errores, ejecuta primero:
    ```sh
    pod deintegrate
    pod install
    ```
  3. Abre el proyecto en Xcode usando el archivo `.xcworkspace` (no el `.xcodeproj`):
    ```sh
    open yochivoy\ Repartidor.xcworkspace
    ```
  4. En Xcode, selecciona tu equipo de desarrollo en la pestaña Signing & Capabilities y asegúrate de que el perfil de aprovisionamiento y el "Team" estén configurados.
  5. Limpia el proyecto en Xcode (`Product > Clean Build Folder`) y luego compila.
  6. Si el error persiste, revisa el archivo `Podfile` y asegúrate de que incluya la línea para OneSignal:
    ```
    pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
    ```
    Luego repite `pod install`.

  **Advertencia CocoaPods: LD_RUNPATH_SEARCH_PATHS**

  Si al ejecutar `pod install` ves una advertencia sobre `LD_RUNPATH_SEARCH_PATHS`:

  > The `yochivoy Repartidor [Debug/Release]` target overrides the `LD_RUNPATH_SEARCH_PATHS` build setting ...

  Sigue estos pasos:

  1. Abre el proyecto en Xcode usando el archivo `.xcworkspace`.
  2. Selecciona el proyecto en el navegador de la izquierda.
  3. Selecciona el target `yochivoy Repartidor`.
  4. Ve a la pestaña **Build Settings**.
  5. Busca `LD_RUNPATH_SEARCH_PATHS`.
  6. Si aparece, edita el valor y agrega `$(inherited)` al inicio (o reemplaza el valor por solo `$(inherited)` si no tienes rutas personalizadas).
  7. Si **no aparece** la opción, no te preocupes: Xcode está usando el valor heredado y no necesitas hacer nada.
  8. Limpia el proyecto (**Product > Clean Build Folder**) y vuelve a compilar.

  Esto asegura que los pods se enlacen correctamente y desaparezca la advertencia.

---

---
Cada uno de estos problemas fue documentado y resuelto para asegurar la correcta ejecución, build y despliegue de la app en dispositivos Android.
# Problema reciente: Crash al iniciar la app por android:name inválido

Si la app se cierra al iniciar y en el archivo `platforms/android/app/src/main/AndroidManifest.xml` ves algo como:

```xml
<application ... android:name="onesignal_google_project_number" ... >
```

Debes eliminar el atributo `android:name` (a menos que uses una clase personalizada válida). El valor de OneSignal debe ir solo como `<meta-data>`, nunca como `android:name`.

**Solución:**

1. Edita el archivo y elimina el atributo:
  ```xml
  <application ... android:name="onesignal_google_project_number" ... >
  ```
  por
  ```xml
  <application ... >
  ```
2. Guarda y reconstruye la app:
  ```sh
  npx cordova build android
  adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
  adb shell monkey -p com.sysmard.yochivoy.repartidor -c android.intent.category.LAUNCHER 1
  ```

3. Si sigue fallando, revisa el log en tiempo real:
  ```sh
  ID=$(adb shell pidof com.sysmard.yochivoy.repartidor)
  if [ -n "$ID" ]; then
    adb logcat --pid=$ID | egrep -i 'FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
  else
    adb logcat | egrep -i 'com.sysmard.yochivoy.repartidor|FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
  fi
  ```

Esto resuelve el crash causado por un valor inválido en el atributo `android:name`.

## Problema común: error:0308010C:digital envelope routines::unsupported

Si al compilar ves este error:

```
Error: error:0308010C:digital envelope routines::unsupported
```

Esto ocurre porque Angular/Webpack no es compatible con Node.js 17+ sin una variable especial.

**Soluciones:**

1. **Usa Node.js 16 o 14** (recomendado):
  ```sh
  nvm install 16
  nvm use 16
  ```

2. **O bien, exporta esta variable antes de compilar:**
  ```sh
  export NODE_OPTIONS=--openssl-legacy-provider
  npm run build -- --prod
  ```

Esto permite compilar aunque uses Node.js 17 o superior, pero lo ideal es usar Node.js 16 para máxima compatibilidad.
# Deliver V1 (Yochivoy Repartidor)

Proyecto Ionic + Angular + Cordova para la app de repartidores de Yochivoy.

## Requisitos del sistema

- **Node.js**: v14.x o v16.x (recomendado v16.x)
- **npm**: v6.x o v8.x
- **Java JDK**: 17 (temurin-17.jdk)
- **Android SDK**: instalado y configurado
- **Cordova CLI**: 10.x o superior
- **Ionic CLI**: 6.x o superior
- **Gradle**: se instala automáticamente por Cordova
- **Dispositivo Android** o emulador
- **Homebrew** (para instalar dependencias en macOS)

## Configuración del entorno

### 1. Instalar Node.js y npm

Recomendado usar [nvm](https://github.com/nvm-sh/nvm):

```sh
nvm install 16
nvm use 16
```

### 2. Instalar Java JDK 17

En macOS:

```sh
brew install --cask temurin17
```

Verifica con:

```sh
/usr/libexec/java_home -V
```

Agrega a tu `~/.zshrc`:

```sh
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

Reinicia la terminal o ejecuta:

```sh
source ~/.zshrc
```

### 3. Instalar Android SDK

Descarga e instala [Android Studio](https://developer.android.com/studio). Asegúrate de instalar el SDK y las herramientas de plataforma.

Agrega a tu `~/.zshrc`:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
```

Reinicia la terminal o ejecuta:

```sh
source ~/.zshrc
```

### 4. Instalar dependencias globales

```sh
npm install -g cordova ionic
```

## Instalación del proyecto

1. Clona el repositorio:

```sh
git clone https://github.com/YochivoyDevelopers/deliver-v1.git
cd deliver-v1
```

2. Instala las dependencias:

```sh
npm install
```

## Compilar y ejecutar la app

### 1. Construir los assets de Angular

```sh
npm run build -- --prod
```

### 2. Sincronizar assets con Cordova (si es necesario)

```sh
npx cordova prepare android
```

### 3. Limpiar y construir la app Android

```sh
npx cordova clean android
npx cordova build android
```

### 4. Instalar el APK en el dispositivo

Conecta tu dispositivo por USB y activa la depuración USB.

```sh
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Lanzar la app en el dispositivo

```sh
adb shell monkey -p com.sysmard.yochivoy.repartidor -c android.intent.category.LAUNCHER 1
```

### 6. Ver logs en tiempo real

```sh
ID=$(adb shell pidof com.sysmard.yochivoy.repartidor)
if [ -n "$ID" ]; then
  adb logcat --pid=$ID | egrep -i 'FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
else
  adb logcat | egrep -i 'com.sysmard.yochivoy.repartidor|FirebaseApp|OneSignal|Unable to open asset URL|WebViewAssetServer'
fi
```

## Notas importantes

- El archivo `AndroidManifest.xml` no debe tener el atributo `android:name` en `<application>` a menos que uses una clase personalizada válida.
- Verifica que los assets de Angular se copien correctamente a `www/` y luego a `platforms/android/app/src/main/assets/www`.
- Si usas plugins nativos, revisa la documentación de cada uno para permisos y configuraciones adicionales.
- Si tienes errores de Java, asegúrate de que `JAVA_HOME` apunte a un JDK (no JRE) y sea versión 17.

## Comandos útiles

- Limpiar plataforma:
  ```sh
  npx cordova clean android
  ```
- Reconstruir APK:
  ```sh
  npx cordova build android
  ```
- Instalar dependencias:
  ```sh
  npm install
  ```
- Ver logs:
  ```sh
  adb logcat | grep com.sysmard.yochivoy.repartidor
  ```

## Contacto y soporte

Para dudas técnicas, contacta a los administradores del repositorio o revisa la documentación oficial de Ionic, Cordova y Android.
