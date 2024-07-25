<script lang="ts">
  export let label;
  export let underlineCharIndex: number = 0; // The index of the character that will be underlined when the section is focused
  export let showShortcut: boolean;

  const firstChars = label.slice(0, underlineCharIndex);
  const underlinedChar = label[underlineCharIndex];
  const restChars = label.slice(underlineCharIndex + 1);
</script>

{firstChars}<span class:underline={showShortcut}>{underlinedChar}</span
>{restChars}
