# Custom Picture Elements Card

A customizable picture elements card for Home Assistant that extends the functionality of the original Home Assistant picture elements card.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)
[![HACS][hacsbadge]][hacs]

[releases-shield]: https://img.shields.io/github/release/yourusername/custom-picture-elements-card.svg?style=for-the-badge
[releases]: https://github.com/yourusername/custom-picture-elements-card/releases
[license-shield]: https://img.shields.io/github/license/yourusername/custom-picture-elements-card.svg?style=for-the-badge
[hacs]: https://github.com/hacs/integration
[hacsbadge]: https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge

## Features

- 🖼️ **Multiple Image Sources**: Static images, cameras, image entities, person entities
- 🎨 **State-Based Styling**: Different images and filters based on entity states
- 🌙 **Dark Mode Support**: Separate images and filters for dark mode
- 📱 **Responsive Design**: Works perfectly on all device sizes
- 🎛️ **Visual Editor**: Easy drag-and-drop configuration interface
- 🔧 **Highly Customizable**: Extensive styling and positioning options
- 🏠 **Theme Integration**: Full Home Assistant theme support

## Installation

### HACS Installation (Recommended)

1. Make sure [HACS](https://hacs.xyz/) is installed
2. Go to HACS → Frontend
3. Click the 3-dot menu → Custom repositories
4. Add repository URL: `https://github.com/yourusername/custom-picture-elements-card`
5. Category: Lovelace
6. Install "Custom Picture Elements Card"
7. Restart Home Assistant

### Manual Installation

1. Download `custom-picture-elements-card.js` from the [latest release](https://github.com/yourusername/custom-picture-elements-card/releases)
2. Copy to `config/www/custom-picture-elements-card.js`
3. Add to your Lovelace resources:

```yaml
resources:
  - url: /local/custom-picture-elements-card.js
    type: module
```

## Quick Start

```yaml
type: custom:custom-picture-elements-card
image: /local/floorplan.png
elements:
  - type: state-badge
    entity: light.living_room
    style:
      top: 50%
      left: 30%
```

## Configuration

| Name           | Type   | Default      | Description                           |
| -------------- | ------ | ------------ | ------------------------------------- |
| `type`         | string | **Required** | `custom:custom-picture-elements-card` |
| `title`        | string | Optional     | Card title                            |
| `image`        | string | Optional     | Main image URL                        |
| `camera_image` | string | Optional     | Camera entity ID                      |
| `elements`     | list   | **Required** | List of overlay elements              |

For complete configuration documentation, see [info.md](info.md).

## Examples

### Basic Floorplan

```yaml
type: custom:custom-picture-elements-card
image: /local/floorplan.png
elements:
  - type: state-icon
    entity: light.kitchen
    style:
      top: 30%
      left: 45%
```

### Camera with Overlays

```yaml
type: custom:custom-picture-elements-card
camera_image: camera.front_door
camera_view: live
elements:
  - type: state-badge
    entity: binary_sensor.front_door
    style:
      top: 10%
      right: 10%
```

### State-Based Images

```yaml
type: custom:custom-picture-elements-card
entity: alarm_control_panel.home
state_image:
  armed_home: /local/house-armed.png
  armed_away: /local/house-away.png
  disarmed: /local/house-disarmed.png
elements:
  - type: state-label
    entity: alarm_control_panel.home
    style:
      top: 90%
      left: 50%
```

## Development

### Building

```bash
npm install
npm run build
```

### Development Server

```bash
npm run build:watch
```

### Linting

```bash
npm run lint
npm run format
```

## Troubleshooting

### Card Not Showing

- Verify the resource is added to your dashboard
- Check browser console for errors
- Ensure Home Assistant is restarted after installation

### Elements Not Positioning

- Make sure elements have `style.top` and `style.left` properties
- Use percentage values for responsive positioning
- Check for CSS conflicts with your theme

### Images Not Loading

- Verify image paths are correct and accessible
- Use `/local/` for files in `config/www/`
- Check Home Assistant logs for file access errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This card is based on the original Home Assistant picture elements card. Thanks to the Home Assistant team for the excellent foundation.
