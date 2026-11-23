// Config plugin: no Windows, os objetos C++ de libs como o react-native-reanimated
// passam do limite de 260 caracteres de caminho (o CMake repete o caminho absoluto
// do projeto dentro de .cxx/.../CMakeFiles) e o ninja falha no mkdir. O AGP passa
// CMAKE_OBJECT_PATH_MAX=1024, então o CMake nunca encurta; com 250 (abaixo dos
// 260 do Windows) ele troca os caminhos longos por um hash. Com 240 o hash do
// gesture-handler (243) não cabia e o CMake mantinha o caminho original.
// Só afeta o build no Windows.
const { withProjectBuildGradle } = require('expo/config-plugins');

const MARCA = 'CMAKE_OBJECT_PATH_MAX=250';
const ANCORA = 'apply plugin: "expo-root-project"';
// Precisa vir antes do expo-root-project: ele já avalia alguns módulos, e depois
// disso é tarde para o finalizeDsl.
const BLOCO_GRADLE = `// Windows: caminho curto para os objetos C++ (plugins/withCaminhoCurtoCmake.js).
if (System.getProperty('os.name').toLowerCase().contains('windows')) {
  subprojects { sp ->
    ['com.android.library', 'com.android.application'].each { id ->
      sp.plugins.withId(id) {
        sp.androidComponents.finalizeDsl { ext ->
          ext.defaultConfig.externalNativeBuild.cmake.arguments.add('-D${MARCA}')
        }
      }
    }
  }
}

`;

module.exports = function withCaminhoCurtoCmake(config) {
  return withProjectBuildGradle(config, (cfg) => {
    const conteudo = cfg.modResults.contents;
    if (!conteudo.includes(MARCA) && conteudo.includes(ANCORA)) {
      cfg.modResults.contents = conteudo.replace(ANCORA, `${BLOCO_GRADLE}${ANCORA}`);
    }
    return cfg;
  });
};
