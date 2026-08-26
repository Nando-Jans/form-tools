<?php

namespace NandoJans\FormTools;

use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;
use Symfony\Component\HttpKernel\Config\FileLocator;
use Symfony\Component\Routing\Loader\YamlFileLoader;

final class NandoJansFormToolsBundle extends AbstractBundle
{

    public function loadExtension(array $config, ContainerConfigurator $configurator, ContainerBuilder $container): void
    {
        $configurator->import('../config/services.yaml');
    }

    public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        if (!interface_exists(AssetMapperInterface::class)) {
            return;
        }

        $bundlesMetadata = $builder->getParameter('kernel.bundles_metadata');
        if (!isset($bundlesMetadata['FrameworkBundle'])) {
            return;
        }

        if (!is_file($bundlesMetadata['FrameworkBundle']['path'].'/Resources/config/asset_mapper.php')) {
            return;
        }

        $assetsDirectory = __DIR__.'/../assets/dist';
        if (!is_dir($assetsDirectory)) {
            return;
        }

        $builder->prependExtensionConfig('framework', [
            'asset_mapper' => [
                'paths' => [
                    $assetsDirectory => '@nando-jans/form-tools',
                ],
            ],
        ]);

        $builder->prependExtensionConfig('twig', [
            'paths' => [
                dirname(__DIR__).'/templates' => 'FormTools',
            ],
        ]);
    }
}
