using System.Reflection;
using WiSave.Shared.Abstractions.Modules;

namespace WiSave.Shared.Infrastructure.Modules;

public static class ModuleLoader
{
    public static IEnumerable<IModule> LoadModules()
    {
        var moduleType = typeof(IModule);
        var assemblies = LoadModuleAssemblies();

        foreach (var assembly in assemblies)
        {
            var types = assembly.GetTypes()
                .Where(t => moduleType.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

            foreach (var type in types)
            {
                if (Activator.CreateInstance(type) is IModule module)
                {
                    yield return module;
                }
            }
        }
    }

    public static IEnumerable<Assembly> GetModuleAssemblies()
    {
        return LoadModuleAssemblies();
    }

    private static IEnumerable<Assembly> LoadModuleAssemblies()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var moduleFiles = Directory.GetFiles(baseDir, "WiSave.Modules.*.dll");

        var loadedAssemblies = new List<Assembly>();

        foreach (var file in moduleFiles)
        {
            try
            {
                var assemblyName = AssemblyName.GetAssemblyName(file);
                var assembly = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(a => a.FullName == assemblyName.FullName)
                    ?? Assembly.LoadFrom(file);

                loadedAssemblies.Add(assembly);
            }
            catch
            {
                // Skip assemblies that fail to load
            }
        }

        return loadedAssemblies;
    }
}
