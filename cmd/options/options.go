package options

import (
	"github.com/caffeine-addictt/template/cmd/utils"
	"github.com/caffeine-addictt/template/cmd/utils/types"
)

type Options struct {
	// The repository Url to use
	// Should be this repository by default
	Repo types.ValueGuard[string]

	// Where the cached repositories will live
	CacheDir types.ValueGuard[string]

	// Wheter or not debug mode should be enabled
	Debug bool
}

// To resolve the options after the user has provided them
func (o *Options) ResolveOptions() error {
	if err := o.resolveCacheDir(); err != nil {
		return err
	}

	return nil
}

func (o *Options) resolveCacheDir() error {
	if o.CacheDir.Value() != "" {
		return nil
	}

	defaultCacheDir, err := utils.GetDefaultCacheDir()
	if err != nil {
		return err
	}

	return o.CacheDir.Set(defaultCacheDir)
}
